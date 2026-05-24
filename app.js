const STORAGE_KEY = "interview-desk-v3";

window.addEventListener("error", (event) => {
  const toast = document.querySelector("#toast");
  if (toast) {
    toast.textContent = `App error: ${event.message}`;
    toast.classList.remove("hidden");
  }
});

const demoState = {
  activeUserId: "u-admin",
  users: [
    { id: "u-admin", name: "Admin", username: "admin", role: "admin", email: "admin@company.local", phone: "+15550000001", theme: "light" },
    { id: "u-hamza", name: "Hamza", username: "hamza", role: "user", email: "hamza@company.local", phone: "+15550000002", theme: "light" },
    { id: "u-ali", name: "Ali", username: "ali", role: "user", email: "ali@company.local", phone: "+15550000003", theme: "light" }
  ],
  interviews: [
    {
      id: "i-1",
      ownerId: "u-hamza",
      profileName: "Hamza",
      companyName: "abc",
      staffingFirm: "xyz staffing",
      interviewAt: "2026-05-24T15:30",
      roundNumber: 1,
      status: "Completed",
      whatsappNumber: "+15550000002",
      interviewers: "John Carter, Sarah Kim",
      interviewLink: "https://meet.example.com/abc-round-1",
      attachment: { name: "hamza-resume.pdf", type: "application/pdf", dataUrl: "" },
      feedback: "Technical round focused on Java, Spring Boot, SQL joins, and behavioral questions. Good discussion, next step expected."
    },
    {
      id: "i-2",
      ownerId: "u-hamza",
      profileName: "Hamza",
      companyName: "abc",
      staffingFirm: "xyz staffing",
      interviewAt: "2026-05-28T11:00",
      roundNumber: 2,
      status: "Scheduled",
      whatsappNumber: "+15550000002",
      interviewers: "Client engineering manager",
      interviewLink: "https://zoom.us/j/123456789",
      attachment: { name: "hamza-client-resume.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", dataUrl: "" },
      feedback: ""
    },
    {
      id: "i-3",
      ownerId: "u-hamza",
      profileName: "Hamza",
      companyName: "abc",
      staffingFirm: "direct",
      interviewAt: "2026-05-29T13:00",
      roundNumber: 1,
      status: "Scheduled",
      whatsappNumber: "+15550000002",
      interviewers: "Internal recruiter",
      interviewLink: "",
      attachment: null,
      feedback: ""
    },
    {
      id: "i-4",
      ownerId: "u-ali",
      profileName: "Ali",
      companyName: "delta health",
      staffingFirm: "Direct",
      interviewAt: "2026-05-26T14:00",
      roundNumber: 1,
      status: "Scheduled",
      whatsappNumber: "+15550000003",
      interviewers: "Mariam Shah",
      interviewLink: "https://teams.microsoft.com/l/interview-delta",
      attachment: null,
      feedback: "Screening round. Recruiter asked about availability, salary range, and migration experience."
    }
  ],
  chatMessages: [
    {
      id: "m-1",
      interviewId: "i-1",
      authorId: "u-hamza",
      body: "Can you check on the second round timing?",
      createdAt: "2026-05-24T10:00"
    }
  ],
  reminded: []
};

let pendingAttachment = null;
let selectedHistoryGroupKey = null;
let pendingConfirmAction = null;
let pendingCompletionInterviewId = null;
let activeChatInterviewId = null;
let pendingOfferInterviewId = null;
let expandedLists = new Set();
let expandedHistoryGroups = new Set();
const LIST_PREVIEW_LIMIT = 25;
let state = loadState();

const els = {
  activeUser: document.querySelector("#activeUser"),
  rolePill: document.querySelector("#rolePill"),
  searchStrip: document.querySelector(".search-strip"),
  globalSearch: document.querySelector("#globalSearch"),
  userFilter: document.querySelector("#userFilter"),
  rangeFilter: document.querySelector("#rangeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  metricGrid: document.querySelector("#metricGrid"),
  interviewForm: document.querySelector("#interviewForm"),
  interviewFormPanel: document.querySelector("#interviewFormPanel"),
  roundPickerPanel: document.querySelector("#roundPickerPanel"),
  roundPickerList: document.querySelector("#roundPickerList"),
  roundSearch: document.querySelector("#roundSearch"),
  roundUserFilter: document.querySelector("#roundUserFilter"),
  interviewChoiceGrid: document.querySelector("#interviewChoiceGrid"),
  interviewId: document.querySelector("#interviewId"),
  ownerSearch: document.querySelector("#ownerSearch"),
  ownerResults: document.querySelector("#ownerResults"),
  ownerId: document.querySelector("#ownerId"),
  profileName: document.querySelector("#profileName"),
  companyName: document.querySelector("#companyName"),
  staffingFirm: document.querySelector("#staffingFirm"),
  interviewAt: document.querySelector("#interviewAt"),
  roundNumber: document.querySelector("#roundNumber"),
  interviewStatus: document.querySelector("#interviewStatus"),
  whatsappNumber: document.querySelector("#whatsappNumber"),
  interviewLink: document.querySelector("#interviewLink"),
  attachmentFile: document.querySelector("#attachmentFile"),
  attachmentPreview: document.querySelector("#attachmentPreview"),
  interviewers: document.querySelector("#interviewers"),
  feedback: document.querySelector("#feedback"),
  feedbackField: document.querySelector("#feedbackField"),
  duplicateWarning: document.querySelector("#duplicateWarning"),
  historyList: document.querySelector("#historyList"),
  historyTitle: document.querySelector("#historyTitle"),
  historyHint: document.querySelector("#historyHint"),
  clearHistoryGroupButton: document.querySelector("#clearHistoryGroupButton"),
  roundsUserFilter: document.querySelector("#roundsUserFilter"),
  roundsMonthFilter: document.querySelector("#roundsMonthFilter"),
  roundsYearFilter: document.querySelector("#roundsYearFilter"),
  roundsTotal: document.querySelector("#roundsTotal"),
  roundsList: document.querySelector("#roundsList"),
  exportRoundsButton: document.querySelector("#exportRoundsButton"),
  offerFormPanel: document.querySelector("#offerFormPanel"),
  offerForm: document.querySelector("#offerForm"),
  userForm: document.querySelector("#userForm"),
  userId: document.querySelector("#userId"),
  userName: document.querySelector("#userName"),
  userUsername: document.querySelector("#userUsername"),
  userEmail: document.querySelector("#userEmail"),
  userPhone: document.querySelector("#userPhone"),
  saveUserButton: document.querySelector("#saveUserButton"),
  clearUserButton: document.querySelector("#clearUserButton"),
  addNewUserButton: document.querySelector("#addNewUserButton"),
  userFormPanel: document.querySelector("#userFormPanel"),
  userFormTitle: document.querySelector("#userFormTitle"),
  hideUserFormButton: document.querySelector("#hideUserFormButton"),
  userSearch: document.querySelector("#userSearch"),
  usersListPanel: document.querySelector("#usersListPanel"),
  userList: document.querySelector("#userList"),
  reminderList: document.querySelector("#reminderList"),
  chatList: document.querySelector("#chatList"),
  reminderStatus: document.querySelector("#reminderStatus"),
  notificationButton: document.querySelector("#notificationButton"),
  formTitle: document.querySelector("#formTitle"),
  exportHistoryButton: document.querySelector("#exportHistoryButton"),
  profileButton: document.querySelector("#profileButton"),
  profileInitials: document.querySelector("#profileInitials"),
  profileMenu: document.querySelector("#profileMenu"),
  profileMenuName: document.querySelector("#profileMenuName"),
  profileMenuRole: document.querySelector("#profileMenuRole"),
  viewAccountButton: document.querySelector("#viewAccountButton"),
  accountThemeButton: document.querySelector("#accountThemeButton"),
  detailModal: document.querySelector("#detailModal"),
  detailTitle: document.querySelector("#detailTitle"),
  detailBody: document.querySelector("#detailBody"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmMessage: document.querySelector("#confirmMessage"),
  confirmYesButton: document.querySelector("#confirmYesButton"),
  confirmNoButton: document.querySelector("#confirmNoButton"),
  chatModal: document.querySelector("#chatModal"),
  chatTitle: document.querySelector("#chatTitle"),
  chatMessages: document.querySelector("#chatMessages"),
  chatText: document.querySelector("#chatText"),
  completionModal: document.querySelector("#completionModal"),
  completionFeedback: document.querySelector("#completionFeedback"),
  offerPosition: document.querySelector("#offerPosition"),
  offerStartDate: document.querySelector("#offerStartDate"),
  toast: document.querySelector("#toast")
};

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("interview-desk-v2");
  const loaded = stored ? { ...structuredClone(demoState), ...JSON.parse(stored) } : structuredClone(demoState);
  loaded.users = loaded.users.map((user) => ({
    ...user,
    email: user.email || "",
    username: user.username || makeUsername(user.name),
    theme: user.theme || "light"
  }));
  loaded.interviews = loaded.interviews.map((item) => ({ interviewLink: "", attachment: null, offerPosition: "", offerStartDate: "", ...item }));
  loaded.interviews = loaded.interviews.map((item) => ({
    ...item,
    status: ["Scheduled", "Completed", "Offer"].includes(item.status) ? item.status : "Scheduled"
  }));
  loaded.chatMessages = loaded.chatMessages || [];
  loaded.reminded = loaded.reminded || [];
  return loaded;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeUser() {
  return state.users.find((user) => user.id === state.activeUserId) || state.users[0];
}

function canAdmin() {
  return activeUser()?.role === "admin";
}

function ownerName(ownerId) {
  return state.users.find((user) => user.id === ownerId)?.name || "Unknown";
}

function ownerPhone(ownerId) {
  return state.users.find((user) => user.id === ownerId)?.phone || "";
}

function ownerEmail(ownerId) {
  return state.users.find((user) => user.id === ownerId)?.email || "";
}

function userSearchLabel(user) {
  return user.name;
}

function userSearchHaystack(user) {
  return normalize(`${user.id} ${user.name} ${user.username || ""} ${user.email || ""} ${user.phone || ""}`);
}

function makeUsername(name) {
  return normalize(name || "user").replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "") || "user";
}

function syncOwnerSearch() {
  const user = state.users.find((item) => item.id === els.ownerId.value);
  els.ownerSearch.value = user ? userSearchLabel(user) : "";
  els.ownerSearch.placeholder = user ? "Search by name, email, or WhatsApp" : "None";
  hideOwnerResults();
}

function syncOwnerFromSearch() {
  const term = normalize(els.ownerSearch.value);
  if (!term) {
    els.ownerId.value = "";
    syncOwnerSearch();
    syncSelectedUserPhone();
    updateDuplicateWarning();
    return false;
  }
  const users = state.users.filter((user) => user.role === "user");
  const exact = users.find((user) => normalize(user.name) === term || normalize(user.email) === term || normalize(user.phone) === term);
  const partial = users.find((user) => userSearchHaystack(user).includes(term));
  const selected = exact || partial;
  if (!selected) return false;
  els.ownerId.value = selected.id;
  syncOwnerSearch();
  syncSelectedUserPhone();
  updateDuplicateWarning();
  return true;
}

function matchingUsersForOwnerSearch() {
  const term = normalize(els.ownerSearch.value);
  const users = state.users.filter((user) => user.role === "user");
  if (!term) return users;
  return users.filter((user) => userSearchHaystack(user).includes(term));
}

function renderOwnerResults() {
  const users = matchingUsersForOwnerSearch();
  els.ownerResults.innerHTML = users
    .map((user) => `<button type="button" class="combo-option" data-owner-select="${user.id}">${escapeHtml(user.name)}</button>`)
    .join("") || `<div class="combo-empty">No matching users</div>`;
  els.ownerResults.classList.remove("hidden");
}

function hideOwnerResults() {
  els.ownerResults.classList.add("hidden");
}

function selectOwner(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  els.ownerId.value = user.id;
  syncOwnerSearch();
  syncSelectedUserPhone();
  updateDuplicateWarning();
}

function baseVisibleInterviews() {
  if (!canAdmin()) return state.interviews.filter((item) => item.ownerId === activeUser().id);
  if (els.userFilter?.value && els.userFilter.value !== "all") return state.interviews.filter((item) => item.ownerId === els.userFilter.value);
  return state.interviews;
}

function filteredInterviews() {
  const term = els.globalSearch.value.trim().toLowerCase();
  const status = ["Scheduled", "Completed", "Offer"].includes(els.statusFilter.value) ? els.statusFilter.value : "all";
  const range = els.rangeFilter.value;
  return baseVisibleInterviews()
    .filter((item) => {
      const haystack = [
        item.profileName,
        item.companyName,
        item.staffingFirm,
        item.interviewers,
        item.feedback,
        item.interviewLink,
        item.attachment?.name,
        ownerName(item.ownerId),
        ownerEmail(item.ownerId)
      ].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (status === "all" || item.status === status) && matchesRange(item, range);
    })
    .sort((a, b) => easternInputToDate(a.interviewAt) - easternInputToDate(b.interviewAt));
}

function matchesRange(item, range) {
  const date = easternInputToDate(item.interviewAt);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  if (range === "all") return true;
  if (range === "today") return easternDayKey(date) === easternDayKey(now);
  if (range === "tomorrow") return easternDayKey(date) === easternDayKey(addDays(now, 1));
  if (range === "week") return date >= startOfWeek;
  if (range === "month") return date >= startOfMonth && date < endOfMonth;
  if (range === "year") return date >= startOfYear && date < endOfYear;
  if (range === "upcoming") return date >= now;
  return true;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function easternDayKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatEst(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    weekday: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short"
  }).format(easternInputToDate(value));
}

function easternInputToDate(value) {
  if (!value) return new Date(NaN);
  if (value.includes("Z")) return new Date(value);
  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  let utc = Date.UTC(year, month - 1, day, hour, minute);

  for (let index = 0; index < 2; index += 1) {
    const easternParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(utc));
    const parts = Object.fromEntries(easternParts.map((part) => [part.type, part.value]));
    const renderedAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    utc += targetAsUtc - renderedAsUtc;
  }

  return new Date(utc);
}

function formatDateOnly(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York"
  }).format(easternInputToDate(value));
}

function formatTimeOnly(value) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short"
  }).format(easternInputToDate(value));
}

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

function interviewGroupKey(item) {
  return [item.ownerId, normalize(item.companyName), normalize(item.staffingFirm || "direct")].join("|");
}

function companyGroups(items) {
  const grouped = new Map();
  items.forEach((item) => {
    const key = interviewGroupKey(item);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  return [...grouped.values()]
    .map((groupItems) => ({
      key: interviewGroupKey(groupItems[0]),
      ownerId: groupItems[0].ownerId,
      company: groupItems[0].companyName,
      staffingFirm: groupItems[0].staffingFirm || "Direct",
      items: groupItems.sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber) || easternInputToDate(a.interviewAt) - easternInputToDate(b.interviewAt))
    }))
    .sort((a, b) => `${a.company} ${a.staffingFirm}`.localeCompare(`${b.company} ${b.staffingFirm}`));
}

function interviewTitleFromParts(company, staffingFirm, profileName) {
  return `${company || "Company"} / ${staffingFirm || "Direct"} - ${profileName || "Profile"}`;
}

function interviewTitle(item) {
  return interviewTitleFromParts(item.companyName, item.staffingFirm || "Direct", item.profileName);
}

function groupTitle(group) {
  const latest = group.items.at(-1) || group.items[0];
  return interviewTitleFromParts(group.company, group.staffingFirm, latest?.profileName);
}

function groupStatus(group) {
  return group.items.every((item) => item.status === "Completed") ? "Completed" : "Scheduled";
}

function groupMeta(group) {
  const latest = group.items.at(-1);
  const status = groupStatus(group);
  return `
    <div class="record-meta">
      <span>Assigned to: ${escapeHtml(ownerName(group.ownerId))}</span>
      <span>Number of rounds: ${group.items.length}</span>
      <span>Date: ${formatEst(latest.interviewAt)}</span>
      <span class="status status-${normalize(status)}">${status}</span>
      ${offerDetails(latest)}
    </div>
  `;
}

function offerDetails(item) {
  if (item.status !== "Offer" && !item.offerPosition && !item.offerStartDate) return "";
  return `
    ${item.offerPosition ? `<span>Position: ${escapeHtml(item.offerPosition)}</span>` : ""}
    ${item.offerStartDate ? `<span>Start date: ${formatDateOnly(item.offerStartDate)}</span>` : ""}
  `;
}

function renderAll() {
  applyTheme();
  renderRoleUi();
  renderUsers();
  renderAccountMenu();
  renderDashboard();
  renderHistory();
  renderRoundsReport();
  renderReminders();
  renderChats();
  renderRoundPicker();
  updateDuplicateWarning();
}

function listItemsForRender(key, rows, limit = LIST_PREVIEW_LIMIT) {
  return expandedLists.has(key) ? rows : rows.slice(0, limit);
}

function listControlBar(key, total, exportKey, limit = LIST_PREVIEW_LIMIT) {
  if (total <= limit) return "";
  const remaining = total - limit;
  return `
    <div class="list-control-bar">
      <span class="muted">Showing ${expandedLists.has(key) ? total : limit} of ${total} filtered results</span>
      <div class="record-actions">
        ${expandedLists.has(key) ? "" : `<button class="small-button" data-expand-list="${key}">View all in web app</button>`}
        <button class="small-button" data-export-list="${exportKey}">Export filtered CSV</button>
      </div>
      ${expandedLists.has(key) ? "" : `<span class="muted">${remaining} more result${remaining === 1 ? "" : "s"} are available after the current filters.</span>`}
    </div>
  `;
}

function resetListPreviews() {
  expandedLists = new Set();
}

function applyTheme() {
  document.body.dataset.theme = activeUser()?.theme || "light";
  els.accountThemeButton.textContent = document.body.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function renderAccountMenu() {
  const user = activeUser();
  els.profileInitials.textContent = initialsFor(user.name);
  els.profileMenuName.textContent = user.name;
  els.profileMenuRole.textContent = user.role === "admin" ? "Admin" : "User";
}

function initialsFor(name) {
  return (name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function toggleProfileMenu() {
  const willOpen = els.profileMenu.classList.contains("hidden");
  els.profileMenu.classList.toggle("hidden", !willOpen);
  els.profileButton.setAttribute("aria-expanded", String(willOpen));
}

function closeProfileMenu() {
  els.profileMenu.classList.add("hidden");
  els.profileButton.setAttribute("aria-expanded", "false");
}

function showAccountDetails() {
  const user = activeUser();
  const interviews = state.interviews.filter((item) => item.ownerId === user.id);
  els.detailTitle.textContent = "Account information";
  els.detailBody.innerHTML = `
    <div class="account-card">
      <div class="account-avatar">${escapeHtml(initialsFor(user.name))}</div>
      <div>
        <h3>${escapeHtml(user.name)}</h3>
        <p>${escapeHtml(user.role === "admin" ? "Administrator" : "User")}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div><span class="muted">Name</span><strong>${escapeHtml(user.name || "Not entered")}</strong></div>
      <div><span class="muted">Username</span><strong>${escapeHtml(user.username || "Not entered")}</strong></div>
      <div><span class="muted">Email</span><strong>${escapeHtml(user.email || "No email")}</strong></div>
      <div><span class="muted">WhatsApp</span><strong>${escapeHtml(user.phone || "No WhatsApp number")}</strong></div>
      <div><span class="muted">User ID</span><strong>${escapeHtml(user.id)}</strong></div>
      <div><span class="muted">Total interviews</span><strong>${interviews.length}</strong></div>
    </div>
  `;
  closeProfileMenu();
  els.detailModal.classList.remove("hidden");
}

function toggleAccountTheme() {
  activeUser().theme = activeUser().theme === "dark" ? "light" : "dark";
  saveState();
  renderAll();
}

function renderRoleUi() {
  document.querySelectorAll(".admin-only").forEach((node) => node.classList.toggle("hidden", !canAdmin()));
  document.querySelector('[data-view="admin"]').classList.toggle("hidden", !canAdmin());
  const activeView = document.querySelector(".view.active")?.id;
  els.searchStrip.classList.toggle("hidden", ["dashboardView", "chatsView", "adminView", "interviewsView"].includes(activeView));
  els.rolePill.textContent = canAdmin() ? "Admin" : "User";
  if (!canAdmin() && document.querySelector("#adminView").classList.contains("active")) switchView("dashboard");
}

function renderUsers() {
  const previousFilter = els.userFilter.value || "all";
  els.activeUser.innerHTML = state.users.map((user) => `<option value="${user.id}">${escapeHtml(user.name)} (${user.role})</option>`).join("");
  els.activeUser.value = state.activeUserId;

  els.userFilter.innerHTML = `<option value="all">All users</option>${state.users
    .filter((user) => user.role === "user")
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`)
    .join("")}`;
  els.userFilter.value = [...els.userFilter.options].some((option) => option.value === previousFilter) ? previousFilter : "all";
  const previousRoundFilter = els.roundUserFilter.value || "all";
  els.roundUserFilter.innerHTML = `<option value="all">All users</option>${state.users
    .filter((user) => user.role === "user")
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`)
    .join("")}`;
  els.roundUserFilter.value = [...els.roundUserFilter.options].some((option) => option.value === previousRoundFilter) ? previousRoundFilter : "all";
  const previousRoundsUser = els.roundsUserFilter.value || "all";
  els.roundsUserFilter.innerHTML = `<option value="all">All users</option>${state.users
    .filter((user) => user.role === "user")
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`)
    .join("")}`;
  els.roundsUserFilter.value = [...els.roundsUserFilter.options].some((option) => option.value === previousRoundsUser) ? previousRoundsUser : "all";
  if (!canAdmin()) els.roundsUserFilter.value = activeUser().id;
  renderRoundDateFilters();

  els.ownerId.innerHTML = `<option value="">None</option>` + state.users
    .filter((user) => user.role === "user")
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)}</option>`)
    .join("");
  syncOwnerSearch();
  syncSelectedUserPhone();

  const userTerm = normalize(els.userSearch?.value || "");
  const usersForList = state.users.filter((user) => !userTerm || userSearchHaystack(user).includes(userTerm));
  const visibleUsers = listItemsForRender("users", usersForList);
  els.userList.innerHTML = listControlBar("users", usersForList.length, "users") + (visibleUsers
    .map((user) => `
      <div class="user-card">
        <strong>${escapeHtml(user.name)}</strong>
        <div class="record-meta">
          <span>Email: ${escapeHtml(user.email || "No email")}</span>
          <span>WhatsApp: ${escapeHtml(user.phone || "No WhatsApp number")}</span>
        </div>
        <div class="record-actions">
          <button class="small-button" data-user-view="${user.id}">View details</button>
          <button class="small-button" data-user-edit="${user.id}">Edit</button>
          ${user.role !== "admin" ? `<button class="small-button danger-button" data-user-delete="${user.id}">Delete</button>` : ""}
        </div>
      </div>
    `)
    .join("") || emptyState("No users match this search."));
}

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
