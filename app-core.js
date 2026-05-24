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

