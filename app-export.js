function exportCsv() {
  const filteredRows = filteredInterviews();
  const selectedGroup = selectedHistoryGroupKey
    ? companyGroups(filteredRows).find((group) => group.key === selectedHistoryGroupKey)
    : null;
  const rows = selectedGroup ? selectedGroup.items : filteredRows;
  const headers = ["User", "Email", "Profile", "Company", "Staffing Firm", "Round", "Status", "Position", "Offer Start Date", "Interviewers", "Date EST", "Interview Link", "Attachment", "Feedback"];
  const csv = [headers, ...rows.map((item) => [
    ownerName(item.ownerId),
    ownerEmail(item.ownerId),
    item.profileName,
    item.companyName,
    item.staffingFirm || "Direct",
    item.roundNumber,
    item.status,
    item.offerPosition || "",
    item.offerStartDate || "",
    item.interviewers,
    formatEst(item.interviewAt),
    item.interviewLink || "",
    item.attachment?.name || "",
    item.feedback || ""
  ])].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportRoundsCsv() {
  const rows = filteredCompletedRounds();
  const headers = ["Assigned To", "Profile", "Company", "Staffing Firm", "Round", "Date EST", "Position", "Offer Start Date", "Interviewers", "Interview Link", "Attachment", "Feedback"];
  const csv = [headers, ...rows.map((item) => [
    ownerName(item.ownerId),
    item.profileName,
    item.companyName,
    item.staffingFirm || "Direct",
    item.roundNumber,
    formatEst(item.interviewAt),
    item.offerPosition || "",
    item.offerStartDate || "",
    item.interviewers,
    item.interviewLink || "",
    item.attachment?.name || "",
    item.feedback || ""
  ])].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `completed-rounds-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportUsersCsv() {
  const userTerm = normalize(els.userSearch?.value || "");
  const rows = state.users.filter((user) => !userTerm || userSearchHaystack(user).includes(userTerm));
  const headers = ["User ID", "Name", "Username", "Role", "Email", "WhatsApp"];
  downloadCsv("users", [headers, ...rows.map((user) => [user.id, user.name, user.username || "", user.role, user.email || "", user.phone || ""])]);
}

function exportRoundPickerCsv() {
  const term = normalize(els.roundSearch.value);
  const userFilter = els.roundUserFilter.value;
  const rows = companyGroups(state.interviews)
    .filter((group) => userFilter === "all" || group.ownerId === userFilter)
    .filter((group) => {
      if (!term) return true;
      const haystack = [
        group.company,
        group.staffingFirm,
        ownerName(group.ownerId),
        ownerEmail(group.ownerId),
        ownerPhone(group.ownerId),
        ...group.items.flatMap((item) => [item.profileName, item.companyName, item.staffingFirm, item.interviewers])
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    })
    .sort((a, b) => easternInputToDate(b.items.at(-1).interviewAt) - easternInputToDate(a.items.at(-1).interviewAt));
  const headers = ["Assigned To", "Company", "Staffing Firm", "Number of Rounds", "Latest Date EST"];
  downloadCsv("existing-interviews", [headers, ...rows.map((group) => [
    ownerName(group.ownerId),
    group.company,
    group.staffingFirm,
    group.items.length,
    formatEst(group.items.at(-1).interviewAt)
  ])]);
}

function exportChatsCsv() {
  const rows = filteredChatInterviews();
  const headers = ["Assigned To", "Profile", "Company", "Staffing Firm", "Round", "Messages", "Latest Message", "Latest Message EST"];
  downloadCsv("interview-chats", [headers, ...rows.map((item) => {
    const messages = chatMessagesFor(item.id);
    const latest = messages.at(-1);
    return [
      ownerName(item.ownerId),
      item.profileName,
      item.companyName,
      item.staffingFirm || "Direct",
      item.roundNumber,
      messages.length,
      latest?.body || "",
      latest ? formatEst(latest.createdAt) : ""
    ];
  })]);
}

function exportListCsv(key) {
  if (key === "history") return exportCsv();
  if (key === "rounds") return exportRoundsCsv();
  if (key === "users") return exportUsersCsv();
  if (key === "roundPicker") return exportRoundPickerCsv();
  if (key === "chats") return exportChatsCsv();
}

function downloadCsv(name, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadAttachment(id) {
  const item = state.interviews.find((record) => record.id === id);
  if (!item?.attachment?.dataUrl) return showToast("This attachment is only recorded by name in demo data.");
  const link = document.createElement("a");
  link.href = item.attachment.dataUrl;
  link.download = item.attachment.name;
  link.click();
}

function checkReminders() {
  const now = new Date();
  state.interviews.forEach((item) => {
    const minutes = (easternInputToDate(item.interviewAt) - now) / 60000;
    const shouldRemind = item.status === "Scheduled" && minutes > 29 && minutes <= 30 && !state.reminded.includes(item.id);
    if (!shouldRemind) return;
    state.reminded.push(item.id);
    saveState();
    const message = `${item.companyName} interview starts in 30 minutes.`;
    showToast(message);
    if ("Notification" in window && Notification.permission === "granted") new Notification("Interview reminder", { body: message });
  });
}

function switchView(viewName) {
  if (viewName === "admin" && !canAdmin()) return;
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewName}View`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  els.searchStrip.classList.toggle("hidden", ["dashboard", "chats", "admin", "interviews"].includes(viewName));
  els.globalSearch.placeholder = viewName === "admin"
    ? "Search users by name, username, email, WhatsApp, or user ID..."
    : "Company, staffing firm, interviewer, profile, feedback...";
  if (viewName === "interviews") {
    els.interviewFormPanel.classList.add("hidden");
    els.roundPickerPanel.classList.add("hidden");
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.add("hidden"), 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

