function renderRoundDateFilters() {
  const monthValue = els.roundsMonthFilter.value || String(new Date().getMonth() + 1);
  const yearValue = els.roundsYearFilter.value || String(new Date().getFullYear());
  const months = [
    ["1", "January"],
    ["2", "February"],
    ["3", "March"],
    ["4", "April"],
    ["5", "May"],
    ["6", "June"],
    ["7", "July"],
    ["8", "August"],
    ["9", "September"],
    ["10", "October"],
    ["11", "November"],
    ["12", "December"]
  ];
  const years = [...new Set([...state.interviews.map((item) => easternInputToDate(item.interviewAt).getFullYear()), new Date().getFullYear()])]
    .filter(Boolean)
    .sort((a, b) => b - a);
  els.roundsMonthFilter.innerHTML = months.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  els.roundsMonthFilter.value = [...els.roundsMonthFilter.options].some((option) => option.value === monthValue) ? monthValue : String(new Date().getMonth() + 1);
  els.roundsYearFilter.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  els.roundsYearFilter.value = [...els.roundsYearFilter.options].some((option) => option.value === yearValue) ? yearValue : String(new Date().getFullYear());
}

function filteredCompletedRounds() {
  const selectedUser = canAdmin() ? els.roundsUserFilter.value : activeUser().id;
  const selectedMonth = Number(els.roundsMonthFilter.value);
  const selectedYear = Number(els.roundsYearFilter.value);
  return state.interviews
    .filter((item) => item.status === "Completed")
    .filter((item) => selectedUser === "all" || item.ownerId === selectedUser)
    .filter((item) => {
      const date = easternInputToDate(item.interviewAt);
      return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
    })
    .sort((a, b) => easternInputToDate(b.interviewAt) - easternInputToDate(a.interviewAt));
}

function renderRoundsReport() {
  const rounds = filteredCompletedRounds();
  const visibleRounds = listItemsForRender("rounds", rounds);
  els.roundsTotal.textContent = rounds.length;
  els.roundsList.innerHTML = listControlBar("rounds", rounds.length, "rounds") + (visibleRounds
    .map((item) => `
      <article class="record-card">
        <strong>${escapeHtml(item.companyName)} · Round ${Number(item.roundNumber)}</strong>
        <div class="record-meta">
          <span>Assigned to: ${escapeHtml(ownerName(item.ownerId))}</span>
          <span>Company: ${escapeHtml(item.companyName)}</span>
          <span>Staffing firm: ${escapeHtml(item.staffingFirm || "Direct")}</span>
          <span>Profile: ${escapeHtml(item.profileName)}</span>
          <span>Date: ${formatEst(item.interviewAt)}</span>
        </div>
        <div class="record-actions">
          ${iconButton("View details", "eye", `data-view-details="${item.id}"`)}
        </div>
      </article>
    `)
    .join("") || emptyState("No completed rounds match these filters."));
}

function renderDashboard() {
  const scope = baseVisibleInterviews();
  const month = scope.filter((item) => matchesRange(item, "month"));
  const year = scope.filter((item) => matchesRange(item, "year"));
  const scheduled = scope.filter((item) => item.status === "Scheduled");
  const completed = scope.filter((item) => item.status === "Completed");
  const offers = scope.filter((item) => item.status === "Offer");
  const today = scope.filter((item) => matchesRange(item, "today"));
  const tomorrow = scope.filter((item) => matchesRange(item, "tomorrow"));
  const metrics = canAdmin()
    ? [
        ["Month total", month.length, "month"],
        ["Year total", year.length, "year"],
        ["Completed", completed.length, "completed"],
        ["Scheduled", scheduled.length, "scheduled"],
        ["Today", today.length, "today"],
        ["Tomorrow", tomorrow.length, "tomorrow"]
      ]
    : [
        ["My month", month.length, "month"],
        ["My year", year.length, "year"],
        ["Completed", completed.length, "completed"],
        ["Scheduled", scheduled.length, "scheduled"],
        ["My offers received", offers.length, "offers"],
        ["Today", today.length, "today"],
        ["Tomorrow", tomorrow.length, "tomorrow"]
      ];

  els.metricGrid.innerHTML = metrics
    .map(([label, value, filter]) => `
      <button class="metric metric-button" type="button" data-dashboard-filter="${filter}">
        <span class="muted">${label}</span>
        <strong>${value}</strong>
      </button>
    `)
    .join("");
}

const icons = {
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8H4v-8M2 8h20v4H2zM12 8v12M12 8H7.5a2.5 2.5 0 1 1 2.1-3.85L12 8Zm0 0h4.5a2.5 2.5 0 1 0-2.1-3.85L12 8Z"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></svg>`,
  hide: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H6l-4 3 1.5-5A8 8 0 1 1 21 12Z"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20l-5 1 1-5L16.5 3.5Z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 8.8c.2 3 2.2 5 5.2 5.2l1.2-1.2c.2-.2.5-.3.8-.2l1.8.5c.3.1.5.4.5.7v1.4c0 .4-.3.7-.7.7A9.7 9.7 0 0 1 8.1 6.2c0-.4.3-.7.7-.7h1.4c.3 0 .6.2.7.5l.5 1.8c.1.3 0 .6-.2.8L9 8.8Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>`,
  paperclip: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7L10 17.4a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>`
};

function iconButton(label, iconName, attributes = "", extraClass = "") {
  return `<button class="small-button icon-button ${extraClass}" type="button" ${attributes} aria-label="${escapeAttribute(label)}" title="${escapeAttribute(label)}">${icons[iconName]}</button>`;
}

function feedbackReminderButton(item) {
  const past = easternInputToDate(item.interviewAt) < new Date();
  if (!canAdmin() || !past || item.feedback.trim()) return "";
  return iconButton("Request feedback", "bell", `data-feedback-reminder="${item.id}"`);
}

function renderHistory() {
  const groups = companyGroups(filteredInterviews());
  const selectedGroup = selectedHistoryGroupKey ? groups.find((group) => group.key === selectedHistoryGroupKey) : null;
  const visibleGroups = selectedHistoryGroupKey && selectedGroup ? [selectedGroup] : groups;
  const renderGroups = selectedHistoryGroupKey ? visibleGroups : listItemsForRender("history", visibleGroups);
  els.historyTitle.textContent = selectedGroup
    ? groupTitle(selectedGroup)
    : "All Interviews";
  els.historyHint.textContent = selectedGroup
    ? `Assigned to: ${ownerName(selectedGroup.ownerId)} · Number of rounds: ${selectedGroup.items.length}`
    : "Rounds, feedback, staffing firm, and interviewers";
  els.clearHistoryGroupButton.classList.toggle("hidden", !selectedHistoryGroupKey);
  els.historyList.innerHTML =
    (selectedHistoryGroupKey ? "" : listControlBar("history", visibleGroups.length, "history")) +
    (renderGroups
      .map((group) => {
        const expanded = selectedHistoryGroupKey || expandedHistoryGroups.has(group.key);
        return `
        <article class="history-card">
          <div class="group-heading">
            <div>
              <strong>${escapeHtml(groupTitle(group))}</strong>
              ${groupMeta(group)}
            </div>
          </div>
          <div class="record-actions">
            ${canAdmin() ? `${iconButton("Add round", "plus", `data-next-round="${escapeAttribute(group.key)}"`)}${iconButton("Received offer", "gift", `data-offer="${escapeAttribute(group.key)}"`)}` : ""}
            ${iconButton("Chat", "chat", `data-open-chat="${group.items.at(-1).id}"`)}
            ${iconButton(expanded ? "Hide rounds" : "View rounds", expanded ? "hide" : "layers", `data-toggle-history-group="${escapeAttribute(group.key)}"`)}
          </div>
          ${expanded ? `<div class="round-stack">${group.items.map(roundCard).join("")}</div>` : ""}
        </article>
      `;
      })
      .join("") || emptyState("No company history found."));
}

function renderRoundPicker() {
  const term = normalize(els.roundSearch.value);
  const userFilter = els.roundUserFilter.value;
  const groups = companyGroups(state.interviews)
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
  const visibleGroups = listItemsForRender("roundPicker", groups);
  els.roundPickerList.innerHTML = listControlBar("roundPicker", groups.length, "roundPicker") + (visibleGroups
    .map((group) => {
      return `
        <article class="record-card">
          <strong>${escapeHtml(groupTitle(group))}</strong>
          ${groupMeta(group)}
          <div class="record-actions">
            ${iconButton("Add round", "plus", `data-next-round="${escapeAttribute(group.key)}"`)}
            ${iconButton("View rounds", "layers", `data-view-group="${escapeAttribute(group.key)}"`)}
          </div>
        </article>
      `;
    })
    .join("") || emptyState("No existing interviews found."));
}

function renderReminders() {
  if (!els.reminderList) return;
  const now = new Date();
  const soon = baseVisibleInterviews()
    .filter((item) => {
      const minutes = (easternInputToDate(item.interviewAt) - now) / 60000;
      return item.status === "Scheduled" && minutes > 0 && minutes <= 24 * 60;
    })
    .sort((a, b) => easternInputToDate(a.interviewAt) - easternInputToDate(b.interviewAt));

  els.reminderList.innerHTML =
    soon
      .map((item) => `
        <article class="record-card">
          <strong>${escapeHtml(item.companyName)} · Round ${Number(item.roundNumber)}</strong>
          <div class="record-meta">
            <span>${formatEst(item.interviewAt)}</span>
            <span>${escapeHtml(ownerName(item.ownerId))}</span>
            <span>${escapeHtml(item.whatsappNumber || ownerPhone(item.ownerId) || "No WhatsApp number")}</span>
          </div>
          <div class="record-actions">
            ${iconButton("Send WhatsApp reminder", "whatsapp", `data-whatsapp="${item.id}"`, "whatsapp-button")}
          </div>
        </article>
      `)
      .join("") || emptyState("No scheduled interviews in the next 24 hours.");
}

function filteredChatInterviews() {
  return baseVisibleInterviews()
    .filter((item) => chatMessagesFor(item.id).length > 0)
    .sort((a, b) => {
      const latestA = chatMessagesFor(a.id).at(-1);
      const latestB = chatMessagesFor(b.id).at(-1);
      return new Date(latestB?.createdAt || 0) - new Date(latestA?.createdAt || 0);
    });
}

function renderChats() {
  const interviews = filteredChatInterviews();
  const visibleInterviews = listItemsForRender("chats", interviews);
  els.chatList.innerHTML = listControlBar("chats", interviews.length, "chats") + (visibleInterviews
    .map((item) => {
      const messages = chatMessagesFor(item.id);
      const latest = messages.at(-1);
      return `
        <article class="record-card">
          <strong>${escapeHtml(interviewTitle(item))}</strong>
          <div class="record-meta">
            <span>Assigned to: ${escapeHtml(ownerName(item.ownerId))}</span>
            <span>Round ${Number(item.roundNumber)}</span>
            <span>${messages.length} message${messages.length === 1 ? "" : "s"}</span>
            ${latest ? `<span>Latest: ${formatEst(latest.createdAt)}</span>` : ""}
          </div>
          ${latest ? `<p>${escapeHtml(latest.body)}</p>` : ""}
          <div class="record-actions">
            ${iconButton("Open chat", "chat", `data-open-chat="${item.id}"`)}
          </div>
        </article>
      `;
    })
    .join("") || emptyState("No interview chats have been started yet."));
}

function groupCard(group) {
  const latest = group.items.at(-1);
  return `
    <article class="record-card">
      <strong>${escapeHtml(groupTitle(group))}</strong>
      ${groupMeta(group)}
      <div class="record-actions">
        ${canAdmin() ? iconButton("Add round", "plus", `data-next-round="${escapeAttribute(group.key)}"`) : ""}
        ${iconButton("Chat", "chat", `data-open-chat="${latest.id}"`)}
        ${iconButton("View rounds", "layers", `data-view-group="${escapeAttribute(group.key)}"`)}
      </div>
    </article>
  `;
}

function roundCard(item) {
  const feedbackBlock = item.feedback ? `<p>${escapeHtml(item.feedback)}</p>` : "";
  return `
    <div class="record-card">
      <strong>${escapeHtml(item.companyName)} · Round ${Number(item.roundNumber)}</strong>
      <div class="record-meta">
        <span>Assigned to: ${escapeHtml(ownerName(item.ownerId))}</span>
        <span>Company: ${escapeHtml(item.companyName)}</span>
        <span>Staffing firm: ${escapeHtml(item.staffingFirm || "Direct")}</span>
        <span>Profile: ${escapeHtml(item.profileName)}</span>
        <span>Date: ${formatEst(item.interviewAt)}</span>
        <span class="status status-${normalize(item.status)}">${escapeHtml(item.status)}</span>
        ${item.interviewers ? `<span>Interviewers: ${escapeHtml(item.interviewers)}</span>` : ""}
        ${offerDetails(item)}
        ${item.interviewLink ? `<a href="${escapeAttribute(item.interviewLink)}" target="_blank" rel="noopener">Interview link</a>` : ""}
        ${item.attachment?.name ? `<span>Attachment: ${escapeHtml(item.attachment.name)}</span>` : ""}
      </div>
      ${feedbackBlock}
      <div class="record-actions">
        ${iconButton("View details", "eye", `data-view-details="${item.id}"`)}
        ${canAdmin() ? `${iconButton("Edit round", "edit", `data-edit="${item.id}"`)}${iconButton("WhatsApp", "whatsapp", `data-whatsapp="${item.id}"`, "whatsapp-button")}` : ""}
        ${!canAdmin() && item.status !== "Completed" ? iconButton("Mark completed", "check", `data-complete-interview="${item.id}"`) : ""}
        ${item.attachment?.dataUrl ? iconButton("Download attachment", "paperclip", `data-download-attachment="${item.id}"`) : ""}
        ${canAdmin() ? iconButton("Delete round", "trash", `data-delete="${item.id}"`, "danger-button") : ""}
      </div>
    </div>
  `;
}

function recordCard(item) {
  return `
    <article class="record-card">
      <strong>${escapeHtml(item.companyName)} · Round ${Number(item.roundNumber)}</strong>
      <div class="record-meta">
        <span>Assigned to: ${escapeHtml(ownerName(item.ownerId))}</span>
        <span>Company: ${escapeHtml(item.companyName)}</span>
        <span>Staffing firm: ${escapeHtml(item.staffingFirm || "Direct")}</span>
        <span>Profile: ${escapeHtml(item.profileName)}</span>
        <span>Date: ${formatEst(item.interviewAt)}</span>
        <span class="status status-${normalize(item.status)}">${escapeHtml(item.status)}</span>
        ${item.interviewers ? `<span>Interviewers: ${escapeHtml(item.interviewers)}</span>` : ""}
        ${offerDetails(item)}
        ${item.interviewLink ? `<a href="${escapeAttribute(item.interviewLink)}" target="_blank" rel="noopener">Interview link</a>` : ""}
        ${item.attachment?.name ? `<span>Attachment: ${escapeHtml(item.attachment.name)}</span>` : ""}
      </div>
      <div class="record-actions">
        ${canAdmin() ? `${iconButton("Edit round", "edit", `data-edit="${item.id}"`)}${iconButton("WhatsApp", "whatsapp", `data-whatsapp="${item.id}"`, "whatsapp-button")}` : ""}
        ${feedbackReminderButton(item)}
        ${!canAdmin() && item.status !== "Completed" ? iconButton("Mark completed", "check", `data-complete-interview="${item.id}"`) : ""}
        ${item.attachment?.dataUrl ? iconButton("Download attachment", "paperclip", `data-download-attachment="${item.id}"`) : ""}
        ${canAdmin() ? iconButton("Delete round", "trash", `data-delete="${item.id}"`, "danger-button") : ""}
      </div>
    </article>
  `;
}

function emptyState(message) {
  return `<p class="muted">${message}</p>`;
}

async function saveInterview(event) {
  event.preventDefault();
  if (!canAdmin()) return;
  if (!validateInterviewForm()) return;
  const id = els.interviewId.value || crypto.randomUUID();
  const existing = state.interviews.find((item) => item.id === id);
  const record = {
    id,
    ownerId: els.ownerId.value,
    profileName: els.profileName.value.trim(),
    companyName: els.companyName.value.trim(),
    staffingFirm: els.staffingFirm.value.trim() || "Direct",
    interviewAt: els.interviewAt.value,
    roundNumber: Number(els.roundNumber.value || 1),
    status: els.interviewStatus.value,
    whatsappNumber: ownerPhone(els.ownerId.value),
    interviewers: els.interviewers.value.trim(),
    interviewLink: els.interviewLink.value.trim(),
    attachment: pendingAttachment ?? existing?.attachment ?? null,
    offerPosition: existing?.offerPosition || "",
    offerStartDate: existing?.offerStartDate || "",
    feedback: existing ? els.feedback.value.trim() : ""
  };

  const existingIndex = state.interviews.findIndex((item) => item.id === id);
  if (existingIndex >= 0) state.interviews[existingIndex] = record;
  else state.interviews.push(record);
  saveState();
  clearForm();
  renderAll();
  showToast("Interview saved.");
  if (existingIndex < 0) {
    window.setTimeout(() => openWhatsapp(id), 200);
  }
}

function editInterview(id) {
  if (!canAdmin()) return;
  const item = state.interviews.find((record) => record.id === id);
  if (!item) return;
  switchView("interviews");
  els.interviewFormPanel.classList.remove("hidden");
  els.roundPickerPanel.classList.add("hidden");
  els.formTitle.textContent = "Edit interview";
  els.interviewId.value = item.id;
  els.ownerId.value = item.ownerId;
  syncOwnerSearch();
  els.profileName.value = item.profileName;
  els.companyName.value = item.companyName;
  els.staffingFirm.value = item.staffingFirm;
  els.interviewAt.value = item.interviewAt;
  els.roundNumber.value = item.roundNumber;
  els.interviewStatus.value = item.status;
  els.whatsappNumber.value = item.whatsappNumber || ownerPhone(item.ownerId);
  els.interviewers.value = item.interviewers;
  els.interviewLink.value = item.interviewLink || "";
  els.feedback.value = item.feedback;
  els.feedbackField.classList.remove("hidden");
  pendingAttachment = item.attachment || null;
  renderAttachmentPreview();
  updateDuplicateWarning();
}

function addNextRound(groupKey) {
  if (!canAdmin()) return;
  const group = companyGroups(state.interviews).find((item) => item.key === groupKey);
  if (!group) return;
  const latest = group.items.at(-1);
  const latestWithAttachment = [...group.items].reverse().find((item) => item.attachment);
  clearForm();
  switchView("interviews");
  els.interviewFormPanel.classList.remove("hidden");
  els.roundPickerPanel.classList.add("hidden");
  els.formTitle.textContent = "Add next round";
  els.ownerId.value = latest.ownerId;
  syncOwnerSearch();
  els.profileName.value = latest.profileName;
  els.companyName.value = latest.companyName;
  els.staffingFirm.value = latest.staffingFirm;
  els.roundNumber.value = Math.max(...group.items.map((item) => Number(item.roundNumber))) + 1;
  els.interviewLink.value = "";
  pendingAttachment = latestWithAttachment?.attachment || null;
  syncSelectedUserPhone();
  renderAttachmentPreview();
  updateDuplicateWarning();
}

function deleteInterview(id) {
  if (!canAdmin()) return;
  state.interviews = state.interviews.filter((item) => item.id !== id);
  state.chatMessages = state.chatMessages.filter((item) => item.interviewId !== id);
  saveState();
  renderAll();
  showToast("Round deleted.");
}

function deleteInterviewGroup(groupKey) {
  if (!canAdmin()) return;
  const group = companyGroups(state.interviews).find((item) => item.key === groupKey);
  if (!group) return;
  const ids = new Set(group.items.map((item) => item.id));
  state.interviews = state.interviews.filter((item) => !ids.has(item.id));
  state.chatMessages = state.chatMessages.filter((item) => !ids.has(item.interviewId));
  expandedHistoryGroups.delete(groupKey);
  if (selectedHistoryGroupKey === groupKey) selectedHistoryGroupKey = null;
  saveState();
  renderAll();
  showToast("Interview deleted.");
}

function deleteUser(id) {
  if (!canAdmin()) return;
  state.users = state.users.filter((user) => user.id !== id);
  state.interviews = state.interviews.filter((item) => item.ownerId !== id);
  state.chatMessages = state.chatMessages.filter((item) => item.authorId !== id);
  if (state.activeUserId === id) state.activeUserId = state.users[0].id;
  saveState();
  renderAll();
  showToast("User deleted.");
}

function clearForm() {
  els.formTitle.textContent = "Add interview";
  els.interviewForm.reset();
  els.interviewId.value = "";
  els.roundNumber.value = 1;
  els.interviewAt.value = easternNowInput();
  pendingAttachment = null;
  els.feedbackField.classList.add("hidden");
  els.ownerId.value = "";
  syncOwnerSearch();
  syncSelectedUserPhone();
  renderAttachmentPreview();
  els.duplicateWarning.classList.add("hidden");
}

function syncSelectedUserPhone() {
  els.whatsappNumber.value = ownerPhone(els.ownerId.value);
}

function easternNowInput() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function renderAttachmentPreview() {
  els.attachmentFile.required = !pendingAttachment;
  if (!pendingAttachment?.name) {
    els.attachmentPreview.classList.add("hidden");
    els.attachmentPreview.innerHTML = "";
    return;
  }
  els.attachmentPreview.innerHTML = `
    <span>Attachment: ${escapeHtml(pendingAttachment.name)}</span>
    <button class="small-button" type="button" id="removeAttachmentButton">Remove</button>
  `;
  els.attachmentPreview.classList.remove("hidden");
}

function showRoundDetails(id) {
  const item = state.interviews.find((record) => record.id === id);
  if (!item) return;
  els.detailTitle.textContent = `${interviewTitle(item)} · Round ${Number(item.roundNumber)}`;
  els.detailBody.innerHTML = `
    <div class="detail-grid">
      <div><span class="muted">Assigned to</span><strong>${escapeHtml(ownerName(item.ownerId))}</strong></div>
      <div><span class="muted">Profile</span><strong>${escapeHtml(item.profileName)}</strong></div>
      <div><span class="muted">Company</span><strong>${escapeHtml(item.companyName)}</strong></div>
      <div><span class="muted">Staffing firm</span><strong>${escapeHtml(item.staffingFirm || "Direct")}</strong></div>
      <div><span class="muted">Date and time</span><strong>${formatEst(item.interviewAt)}</strong></div>
      <div><span class="muted">Status</span><strong>${escapeHtml(item.status)}</strong></div>
      <div><span class="muted">Position</span><strong>${escapeHtml(item.offerPosition || "None entered")}</strong></div>
      <div><span class="muted">Offer start date</span><strong>${item.offerStartDate ? formatDateOnly(item.offerStartDate) : "None entered"}</strong></div>
      <div><span class="muted">Interviewers</span><strong>${escapeHtml(item.interviewers || "None entered")}</strong></div>
      <div><span class="muted">Interview link</span><strong>${item.interviewLink ? `<a href="${escapeAttribute(item.interviewLink)}" target="_blank" rel="noopener">Open link</a>` : "None entered"}</strong></div>
      <div><span class="muted">Attachment</span><strong>${escapeHtml(item.attachment?.name || "None attached")}</strong></div>
    </div>
    <div class="detail-feedback">
      <span class="muted">Feedback</span>
      <p>${escapeHtml(item.feedback || "No feedback entered yet.")}</p>
    </div>
  `;
  els.detailModal.classList.remove("hidden");
}

function closeRoundDetails() {
  els.detailModal.classList.add("hidden");
}

function showUserDetails(id) {
  const user = state.users.find((item) => item.id === id);
  if (!user) return;
  const interviews = state.interviews.filter((item) => item.ownerId === user.id);
  els.detailTitle.textContent = user.name;
  els.detailBody.innerHTML = `
    <div class="detail-grid">
      <div><span class="muted">User ID</span><strong>${escapeHtml(user.id)}</strong></div>
      <div><span class="muted">Username</span><strong>${escapeHtml(user.username || "No username")}</strong></div>
      <div><span class="muted">Role</span><strong>${escapeHtml(user.role)}</strong></div>
      <div><span class="muted">Email</span><strong>${escapeHtml(user.email || "No email")}</strong></div>
      <div><span class="muted">WhatsApp</span><strong>${escapeHtml(user.phone || "No WhatsApp number")}</strong></div>
      <div><span class="muted">Total interviews</span><strong>${interviews.length}</strong></div>
    </div>
  `;
  els.detailModal.classList.remove("hidden");
}

function askConfirm(message, action) {
  pendingConfirmAction = action;
  els.confirmMessage.textContent = message;
  els.confirmModal.classList.remove("hidden");
}

function closeConfirm() {
  pendingConfirmAction = null;
  els.confirmModal.classList.add("hidden");
}

function runConfirmedAction() {
  const action = pendingConfirmAction;
  closeConfirm();
  if (action) action();
}

