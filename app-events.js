document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.view) switchView(target.dataset.view);
  if (target.dataset.viewJump) switchView(target.dataset.viewJump);
  if (target.dataset.dashboardFilter) openDashboardList(target.dataset.dashboardFilter);
  if (target.dataset.viewGroup) showHistoryGroup(target.dataset.viewGroup);
  if (target.dataset.toggleHistoryGroup) {
    const key = target.dataset.toggleHistoryGroup;
    if (expandedHistoryGroups.has(key)) expandedHistoryGroups.delete(key);
    else expandedHistoryGroups.add(key);
    renderHistory();
  }
  if (target.dataset.edit) askConfirm("Are you sure you want to edit this interview?", () => editInterview(target.dataset.edit));
  if (target.dataset.delete) askConfirm("Are you sure you want to delete this round?", () => deleteInterview(target.dataset.delete));
  if (target.dataset.offer) openOfferForm(target.dataset.offer);
  if (target.dataset.whatsapp) askConfirm("Send this WhatsApp reminder?", () => openWhatsapp(target.dataset.whatsapp));
  if (target.dataset.feedbackReminder) askConfirm("Send a feedback reminder to this user?", () => openWhatsapp(target.dataset.feedbackReminder, "feedback"));
  if (target.dataset.openChat) openChat(target.dataset.openChat);
  if (target.dataset.completeInterview) startCompletion(target.dataset.completeInterview);
  if (target.dataset.nextRound) askConfirm("Are you sure you want to add another round to this interview?", () => addNextRound(target.dataset.nextRound));
  if (target.dataset.userView) showUserDetails(target.dataset.userView);
  if (target.dataset.userEdit) askConfirm("Are you sure you want to edit this user?", () => editUser(target.dataset.userEdit));
  if (target.dataset.downloadAttachment) downloadAttachment(target.dataset.downloadAttachment);
  if (target.dataset.viewDetails) showRoundDetails(target.dataset.viewDetails);
  if (target.dataset.ownerSelect) selectOwner(target.dataset.ownerSelect);
  if (target.id === "chooseNewInterview") showInterviewForm("new");
  if (target.id === "chooseExistingRound") showRoundPicker();
  if (target.id === "cancelRoundPicker") els.roundPickerPanel.classList.add("hidden");
  if (target.id === "removeAttachmentButton") {
    pendingAttachment = null;
    els.attachmentFile.value = "";
    renderAttachmentPreview();
  }
  if (target.id === "clearFormButton") clearForm();
  if (target.id === "clearHistoryGroupButton") showAllHistoryGroups();
  if (target.id === "clearUserButton") clearUserForm();
  if (target.id === "profileAddInterviewButton") {
    closeProfileMenu();
    switchView("interviews");
    resetAddInterviewWorkspace();
  }
  if (target.id === "closeDetailButton") closeRoundDetails();
  if (target.id === "confirmYesButton") runConfirmedAction();
  if (target.id === "confirmNoButton") closeConfirm();
  if (target.id === "profileButton") toggleProfileMenu();
  if (target.id === "viewAccountButton") showAccountDetails();
  if (target.id === "accountThemeButton") toggleAccountTheme();
  if (target.id === "exportHistoryButton") exportCsv();
  if (target.id === "exportRoundsButton") exportRoundsCsv();
  if (target.dataset.expandList) {
    expandedLists.add(target.dataset.expandList);
    renderAll();
  }
  if (target.dataset.exportList) exportListCsv(target.dataset.exportList);
  if (target.id === "sendChatButton") sendChatMessage();
  if (target.id === "closeChatButton") closeChat();
  if (target.id === "saveCompletionButton") saveCompletion();
  if (target.id === "closeCompletionButton") closeCompletionModal();
  if (target.id === "cancelOfferButton") closeOfferForm();
  if (target.id === "addNewUserButton") showUserForm("add");
  if (target.id === "hideUserFormButton") hideUserForm();
  if (target.id === "seedButton") {
    state = structuredClone(demoState);
    pendingAttachment = null;
    saveState();
    renderAll();
    showToast("Demo data restored.");
  }
  if (target.id === "notificationButton") {
    if (!("Notification" in window)) {
      els.reminderStatus.textContent = "Browser alerts are unavailable here. WhatsApp reminder links still work.";
      return;
    }
    Notification.requestPermission().then((permission) => {
      els.reminderStatus.textContent = permission === "granted"
        ? "Browser alerts are enabled. WhatsApp reminders can be opened from reminder cards."
        : "Browser alerts were not enabled. WhatsApp reminder links still work.";
    });
  }
  if (target.dataset.userDelete) askConfirm("Are you sure you want to delete this user?", () => deleteUser(target.dataset.userDelete));
  if (target.id === "viewUsersButton") {
    els.usersListPanel.classList.remove("hidden");
    renderUsers();
  }
  if (target.id === "hideUsersButton") els.usersListPanel.classList.add("hidden");
});

els.interviewForm.addEventListener("submit", saveInterview);
els.offerForm.addEventListener("submit", saveOffer);
els.userForm.addEventListener("submit", saveUser);
els.ownerId.addEventListener("change", () => {
  syncOwnerSearch();
  syncSelectedUserPhone();
  updateDuplicateWarning();
});
els.ownerSearch.addEventListener("change", syncOwnerFromSearch);
els.ownerSearch.addEventListener("input", renderOwnerResults);
els.ownerSearch.addEventListener("focus", renderOwnerResults);
els.ownerSearch.addEventListener("blur", () => {
  window.setTimeout(() => {
    if (!syncOwnerFromSearch()) syncOwnerSearch();
    hideOwnerResults();
  }, 120);
});
els.roundSearch.addEventListener("input", () => {
  resetListPreviews();
  renderRoundPicker();
});
els.roundUserFilter.addEventListener("input", () => {
  resetListPreviews();
  renderRoundPicker();
});
els.attachmentFile.addEventListener("change", () => {
  const file = els.attachmentFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingAttachment = { name: file.name, type: file.type, dataUrl: reader.result };
    renderAttachmentPreview();
  };
  reader.readAsDataURL(file);
});
[els.globalSearch, els.userFilter, els.rangeFilter, els.statusFilter].forEach((control) => control.addEventListener("input", () => {
  resetListPreviews();
  renderAll();
}));
els.userSearch.addEventListener("input", () => {
  resetListPreviews();
  renderUsers();
});
[els.roundsUserFilter, els.roundsMonthFilter, els.roundsYearFilter].forEach((control) => control.addEventListener("input", () => {
  resetListPreviews();
  renderRoundsReport();
}));
[els.companyName, els.staffingFirm, els.interviewers].forEach((control) => control.addEventListener("input", updateDuplicateWarning));
els.activeUser.addEventListener("change", () => {
  state.activeUserId = els.activeUser.value;
  saveState();
  clearForm();
  clearUserForm();
  renderAll();
});

renderAll();
window.setInterval(checkReminders, 30000);
