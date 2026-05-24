function showInterviewForm(mode = "new") {
  els.interviewFormPanel.classList.remove("hidden");
  els.roundPickerPanel.classList.add("hidden");
  if (mode === "new") {
    clearForm();
    els.formTitle.textContent = "Add new interview";
  }
}

function showRoundPicker() {
  els.interviewFormPanel.classList.add("hidden");
  els.roundPickerPanel.classList.remove("hidden");
  renderRoundPicker();
}

function resetAddInterviewWorkspace() {
  els.interviewFormPanel.classList.add("hidden");
  els.roundPickerPanel.classList.add("hidden");
  clearForm();
}

function validateInterviewForm() {
  if (!syncOwnerFromSearch()) {
    showToast("Select a matching assigned user.");
    renderOwnerResults();
    return false;
  }
  if (!els.interviewLink.value.trim()) {
    showToast("Interview link is required.");
    els.interviewLink.focus();
    return false;
  }
  const existing = state.interviews.find((item) => item.id === els.interviewId.value);
  if (!pendingAttachment && !existing?.attachment) {
    showToast("Attachment is required.");
    els.attachmentFile.focus();
    return false;
  }
  return true;
}

function showHistoryGroup(groupKey) {
  selectedHistoryGroupKey = groupKey;
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector("#historyView").classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === "history"));
  renderHistory();
}

function showAllHistoryGroups() {
  selectedHistoryGroupKey = null;
  renderHistory();
}

function openDashboardList(filter) {
  selectedHistoryGroupKey = null;
  els.globalSearch.value = "";
  els.statusFilter.value = "all";
  els.rangeFilter.value = "all";

  if (filter === "month") els.rangeFilter.value = "month";
  if (filter === "year") els.rangeFilter.value = "year";
  if (filter === "today") els.rangeFilter.value = "today";
  if (filter === "tomorrow") els.rangeFilter.value = "tomorrow";
  if (filter === "completed") els.statusFilter.value = "Completed";
  if (filter === "scheduled") els.statusFilter.value = "Scheduled";
  if (filter === "offers") els.statusFilter.value = "Offer";

  switchView("history");
  renderHistory();
}

function updateDuplicateWarning() {
  els.duplicateWarning.innerHTML = "";
  els.duplicateWarning.classList.add("hidden");
}

function reminderMessage(item) {
  return [
    "Interview Reminder:",
    "",
    `Profile: ${item.profileName || ownerName(item.ownerId)}`,
    "",
    `Round: ${Number(item.roundNumber)}`,
    "",
    `Company: ${item.companyName}`,
    "",
    `Staffing Firm: ${item.staffingFirm || "Direct"}`,
    "",
    `Interviewers: ${item.interviewers || ""}`,
    "",
    `Date: ${formatDateOnly(item.interviewAt)}`,
    "",
    `Time: ${formatTimeOnly(item.interviewAt)}`,
    "",
    `Interview Link: ${item.interviewLink || ""}`,
    "",
    `Attachment: ${item.attachment?.name || ""}`
  ].join("\n");
}

function feedbackReminderMessage(item) {
  return [
    "Feedback Reminder:",
    "",
    `Profile: ${item.profileName || ownerName(item.ownerId)}`,
    "",
    `Round: ${Number(item.roundNumber)}`,
    "",
    `Company: ${item.companyName}`,
    "",
    `Staffing Firm: ${item.staffingFirm || "Direct"}`,
    "",
    `Interviewers: ${item.interviewers || ""}`,
    "",
    `Date: ${formatDateOnly(item.interviewAt)}`,
    "",
    `Time: ${formatTimeOnly(item.interviewAt)}`,
    "",
    "Please fill in your interview feedback when you get a chance."
  ].join("\n");
}

function offerMessage(item) {
  return [
    "Offer Received:",
    "",
    `Profile: ${item.profileName || ownerName(item.ownerId)}`,
    "",
    `Company: ${item.companyName}`,
    "",
    `Staffing Firm: ${item.staffingFirm || "Direct"}`,
    "",
    `Position: ${item.offerPosition || ""}`,
    "",
    `Start Date: ${item.offerStartDate ? formatDateOnly(item.offerStartDate) : ""}`,
    "",
    `Your interview for ${item.companyName} on ${item.profileName || ownerName(item.ownerId)} has received an offer and is expected to start on ${item.offerStartDate ? formatDateOnly(item.offerStartDate) : "the provided start date"}.`
  ].join("\n");
}

function openWhatsapp(id, mode = "interview") {
  if (!canAdmin()) return;
  const item = state.interviews.find((record) => record.id === id);
  if (!item) return;
  const phone = (item.whatsappNumber || ownerPhone(item.ownerId) || "").replace(/[^\d]/g, "");
  if (!phone) {
    showToast("Add a WhatsApp number for this user first.");
    return;
  }
  const message = mode === "feedback" ? feedbackReminderMessage(item) : mode === "offer" ? offerMessage(item) : reminderMessage(item);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

function startCompletion(id) {
  if (canAdmin()) return;
  const item = state.interviews.find((record) => record.id === id && record.ownerId === activeUser().id);
  if (!item) return;
  pendingCompletionInterviewId = id;
  els.completionFeedback.value = item.feedback || "";
  els.completionModal.classList.remove("hidden");
  els.completionFeedback.focus();
}

function closeCompletionModal() {
  pendingCompletionInterviewId = null;
  els.completionModal.classList.add("hidden");
}

function saveCompletion() {
  if (canAdmin() || !pendingCompletionInterviewId) return;
  const item = state.interviews.find((record) => record.id === pendingCompletionInterviewId && record.ownerId === activeUser().id);
  if (!item) return closeCompletionModal();
  const feedback = els.completionFeedback.value.trim();
  if (!feedback) {
    showToast("Feedback is required before marking completed.");
    els.completionFeedback.focus();
    return;
  }
  item.feedback = feedback;
  item.status = "Completed";
  saveState();
  closeCompletionModal();
  renderAll();
  showToast("Interview marked completed.");
}

function chatMessagesFor(interviewId) {
  return state.chatMessages
    .filter((message) => message.interviewId === interviewId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function openChat(id) {
  const item = baseVisibleInterviews().find((record) => record.id === id);
  if (!item) return;
  activeChatInterviewId = id;
  els.chatTitle.textContent = interviewTitle(item);
  els.chatText.value = "";
  renderChatMessages();
  els.chatModal.classList.remove("hidden");
  els.chatText.focus();
}

function closeChat() {
  activeChatInterviewId = null;
  els.chatModal.classList.add("hidden");
}

function renderChatMessages() {
  if (!activeChatInterviewId) return;
  const messages = chatMessagesFor(activeChatInterviewId);
  els.chatMessages.innerHTML = messages
    .map((message) => `
      <div class="chat-bubble ${message.authorId === activeUser().id ? "own-message" : ""}">
        <strong>${escapeHtml(ownerName(message.authorId))}</strong>
        <p>${escapeHtml(message.body)}</p>
        <span>${formatEst(message.createdAt)}</span>
      </div>
    `)
    .join("") || emptyState("No messages yet.");
}

function sendChatMessage() {
  if (!activeChatInterviewId) return;
  const body = els.chatText.value.trim();
  if (!body) {
    showToast("Write a message first.");
    els.chatText.focus();
    return;
  }
  state.chatMessages.push({
    id: crypto.randomUUID(),
    interviewId: activeChatInterviewId,
    authorId: activeUser().id,
    body,
    createdAt: new Date().toISOString()
  });
  els.chatText.value = "";
  saveState();
  renderChatMessages();
  renderChats();
}

function openOfferForm(groupKey) {
  if (!canAdmin()) return;
  const group = companyGroups(state.interviews).find((item) => item.key === groupKey);
  if (!group) return;
  const latest = group.items.at(-1);
  pendingOfferInterviewId = latest.id;
  els.offerPosition.value = latest.offerPosition || "";
  els.offerStartDate.value = latest.offerStartDate || "";
  switchView("history");
  els.offerFormPanel.classList.remove("hidden");
  els.offerPosition.focus();
}

function closeOfferForm() {
  pendingOfferInterviewId = null;
  els.offerForm.reset();
  els.offerFormPanel.classList.add("hidden");
}

function saveOffer(event) {
  event?.preventDefault();
  if (!canAdmin() || !pendingOfferInterviewId) return;
  const item = state.interviews.find((record) => record.id === pendingOfferInterviewId);
  if (!item) return closeOfferForm();
  const position = els.offerPosition.value.trim();
  const startDate = els.offerStartDate.value;
  if (!position || !startDate) {
    showToast("Position and start date are required.");
    return;
  }
  askConfirm("Save this offer and send the WhatsApp message to the assigned user?", () => commitOffer(item.id, position, startDate));
}

function commitOffer(id, position, startDate) {
  const item = state.interviews.find((record) => record.id === id);
  if (!item) return closeOfferForm();
  item.offerPosition = position;
  item.offerStartDate = startDate;
  item.status = "Offer";
  saveState();
  closeOfferForm();
  renderAll();
  showToast("Offer saved.");
  window.setTimeout(() => openWhatsapp(item.id, "offer"), 200);
}

function editUser(id) {
  if (!canAdmin()) return;
  const user = state.users.find((item) => item.id === id);
  if (!user) return;
  showUserForm("edit");
  els.userId.value = user.id;
  els.userName.value = user.name;
  els.userUsername.value = user.username || "";
  els.userEmail.value = user.email || "";
  els.userPhone.value = user.phone || "";
  els.saveUserButton.textContent = "Save user";
}

function clearUserForm() {
  els.userForm.reset();
  els.userId.value = "";
  els.saveUserButton.textContent = "Add user";
  els.userFormTitle.textContent = "Add user";
}

function showUserForm(mode = "add") {
  if (!canAdmin()) return;
  if (mode === "add") clearUserForm();
  els.userFormTitle.textContent = mode === "edit" ? "Edit user" : "Add user";
  els.saveUserButton.textContent = mode === "edit" ? "Save user" : "Add user";
  els.userFormPanel.classList.remove("hidden");
}

function hideUserForm() {
  els.userFormPanel.classList.add("hidden");
  clearUserForm();
}

function saveUser(event) {
  event.preventDefault();
  if (!canAdmin()) return;
  const name = els.userName.value.trim();
  const username = els.userUsername.value.trim();
  const email = els.userEmail.value.trim();
  const phone = els.userPhone.value.trim();
  if (!name || !username) {
    showToast("Name and username are required.");
    return;
  }
  const currentId = els.userId.value;
  const duplicate = state.users.find((user) => {
    if (user.id === currentId) return false;
    const sameUsername = normalize(user.username) === normalize(username);
    const sameEmail = email && normalize(user.email) === normalize(email);
    const samePhone = phone && normalize(user.phone) === normalize(phone);
    return sameUsername || sameEmail || samePhone;
  });
  if (duplicate) {
    showToast("Username, email, and WhatsApp number must be unique for each user.");
    return;
  }
  const details = [
    `Name: ${name}`,
    `Username: ${username}`,
    `Email: ${email || "Not entered"}`,
    `WhatsApp: ${phone || "Not entered"}`
  ].join("\n");
  askConfirm(`Please confirm these user details are correct:\n\n${details}`, commitUserForm);
}

function commitUserForm() {
  if (!canAdmin()) return;
  const existing = state.users.find((user) => user.id === els.userId.value);
  if (existing) {
    existing.name = els.userName.value.trim();
    existing.username = els.userUsername.value.trim();
    existing.email = els.userEmail.value.trim();
    existing.phone = els.userPhone.value.trim();
    state.interviews.forEach((item) => {
      if (item.ownerId === existing.id) item.whatsappNumber = existing.phone;
    });
    showToast("User updated.");
  } else {
    state.users.push({
      id: crypto.randomUUID(),
      name: els.userName.value.trim(),
      username: els.userUsername.value.trim(),
      email: els.userEmail.value.trim(),
      phone: els.userPhone.value.trim(),
      role: "user",
      theme: "light"
    });
    showToast("User added.");
  }
  clearUserForm();
  hideUserForm();
  saveState();
  renderAll();
}

