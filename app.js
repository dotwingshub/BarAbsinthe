/* ===================================================
   Bar Absinthe - バー管理システム
   app.js - メインアプリケーションロジック
=================================================== */

// ===== ユーティリティ =====

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatPrice(n) {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function thisMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

function isoToDateStr(iso) { return iso.slice(0, 10); }
function isoToMonthStr(iso) { return iso.slice(0, 7); }

function dateStrToJa(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const weekdays = ['日','月','火','水','木','金','土'];
  const w = weekdays[new Date(dateStr).getDay()];
  return `${y}/${m}/${d} (${w})`;
}

function monthStrToJa(monthStr) {
  const [y, m] = monthStr.split('-');
  return `${y}年${parseInt(m,10)}月`;
}

// ===== LocalStorage =====

const KEYS = { MENU: 'bar_menu_items', ORDERS: 'bar_orders' };

function loadMenu()   { return JSON.parse(localStorage.getItem(KEYS.MENU)   || '[]'); }
function saveMenu(v)  { localStorage.setItem(KEYS.MENU,   JSON.stringify(v)); }
function loadOrders() { return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'); }
function saveOrders(v){ localStorage.setItem(KEYS.ORDERS, JSON.stringify(v)); }

// ===== デフォルトメニュー =====

function initDefaultMenu() {
  if (loadMenu().length === 0) {
    saveMenu([
      { id: genId(), name: 'ウイスキーソーダ',     price: 800,  category: 'ドリンク' },
      { id: genId(), name: 'バーボンロック',         price: 900,  category: 'ドリンク' },
      { id: genId(), name: 'ジントニック',           price: 750,  category: 'ドリンク' },
      { id: genId(), name: 'モスコミュール',         price: 800,  category: 'ドリンク' },
      { id: genId(), name: 'アブサン',               price: 1200, category: 'ドリンク' },
      { id: genId(), name: 'カシスソーダ',           price: 700,  category: 'ドリンク' },
      { id: genId(), name: 'ノンアルコールコーラ',   price: 500,  category: 'ドリンク' },
      { id: genId(), name: 'ミックスナッツ',         price: 400,  category: 'フード'   },
      { id: genId(), name: 'チーズ盛り合わせ',       price: 800,  category: 'フード'   },
      { id: genId(), name: 'オリーブ',               price: 350,  category: 'フード'   },
    ]);
  }
}

// ===== トースト通知 =====

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2200);
}

// ===== タブナビゲーション =====

function initTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
      });
      const el = document.getElementById('tab-' + tab);
      el.classList.remove('hidden');
      el.classList.add('active');

      if (tab === 'orders')   renderOrdersList();
      if (tab === 'menu')     renderMenuList();
      if (tab === 'checkout') renderCheckoutList();
      if (tab === 'reports')  initReports();
    });
  });
}

// ===================================================
//   伝票管理タブ
// ===================================================

let activeOrderId = null;
let menuSelectorCategory = 'all';

function renderOrdersList() {
  const orders = loadOrders().filter(o => o.status === 'open');
  const container = document.getElementById('orders-list');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">🍸</span>オープン中の伝票はありません</div>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const count = order.items.reduce((s, i) => s + i.quantity, 0);
    const typeBadge = order.customerType === '新規'
      ? '<span class="type-badge new-badge">新規</span>'
      : '<span class="type-badge return-badge">再来</span>';
    card.innerHTML = `
      <div class="table-label">テーブル ${typeBadge}</div>
      <div class="table-number">${escHtml(order.tableNumber)}</div>
      <div class="order-count">${order.people}名 / ${count} 品</div>
      <div class="order-total">${formatPrice(order.total)}</div>
      <div class="order-time">${formatTime(order.createdAt)} 〜</div>
    `;
    card.addEventListener('click', () => openOrderDetail(order.id));
    container.appendChild(card);
  });
}

function openOrderDetail(orderId) {
  activeOrderId = orderId;
  const panel = document.getElementById('order-detail-panel');
  panel.classList.remove('hidden');
  const order = loadOrders().find(o => o.id === orderId);
  if (!order) return;
  document.getElementById('order-detail-title').textContent = `テーブル ${order.tableNumber}`;
  renderMenuSelectorList();
  renderOrderItemsList();
}

function closeOrderDetail() {
  activeOrderId = null;
  document.getElementById('order-detail-panel').classList.add('hidden');
}

// --- メニューセレクター ---

function renderMenuSelectorList() {
  const menu = loadMenu();
  const list = document.getElementById('menu-selector-list');
  list.innerHTML = '';
  const filtered = menuSelectorCategory === 'all' ? menu : menu.filter(m => m.category === menuSelectorCategory);

  if (filtered.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:12px;">メニューがありません</div>';
    return;
  }
  filtered.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-item-btn';
    btn.innerHTML = `<span class="item-name">${escHtml(item.name)}</span><span class="item-price">${formatPrice(item.price)}</span>`;
    btn.addEventListener('click', () => addItemToOrder(item));
    list.appendChild(btn);
  });
}

function addItemToOrder(menuItem) {
  if (!activeOrderId) return;
  const orders = loadOrders();
  const order = orders.find(o => o.id === activeOrderId);
  if (!order) return;
  const existing = order.items.find(i => i.menuItemId === menuItem.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    order.items.push({ menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 });
  }
  order.total = calcOrderTotal(order.items);
  saveOrders(orders);
  renderOrderItemsList();
}

function calcOrderTotal(items) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

// --- 注文アイテムリスト ---

function renderOrderItemsList() {
  if (!activeOrderId) return;
  const order = loadOrders().find(o => o.id === activeOrderId);
  if (!order) return;

  // メタ情報（人数・客種別）
  const metaEl = document.getElementById('order-detail-meta');
  const typeBadge = order.customerType === '新規'
    ? '<span class="type-badge new-badge">新規</span>'
    : '<span class="type-badge return-badge">再来</span>';
  metaEl.innerHTML = `<span class="meta-info">${order.people}名 ${typeBadge}</span>`;

  const list = document.getElementById('order-items-list');
  list.innerHTML = '';

  if (order.items.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:16px 0;">左のメニューから追加してください</div>';
    document.getElementById('order-detail-total').textContent = '¥0';
    return;
  }

  order.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'order-item-row';
    row.innerHTML = `
      <span class="order-item-name">${escHtml(item.name)}</span>
      <div class="qty-controls">
        <button class="qty-btn" data-action="minus" data-idx="${idx}">－</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-action="plus" data-idx="${idx}">＋</button>
      </div>
      <span class="order-item-subtotal">${formatPrice(item.price * item.quantity)}</span>
    `;
    list.appendChild(row);
  });
  document.getElementById('order-detail-total').textContent = formatPrice(order.total);

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeItemQty(parseInt(btn.dataset.idx, 10), btn.dataset.action));
  });
}

function changeItemQty(idx, action) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === activeOrderId);
  if (!order) return;
  if (action === 'plus') {
    order.items[idx].quantity += 1;
  } else {
    order.items[idx].quantity -= 1;
    if (order.items[idx].quantity <= 0) order.items.splice(idx, 1);
  }
  order.total = calcOrderTotal(order.items);
  saveOrders(orders);
  renderOrderItemsList();
}

// --- 新規伝票作成 ---

function initOrdersTab() {
  document.getElementById('btn-new-order').addEventListener('click', () => {
    document.getElementById('new-order-form').classList.remove('hidden');
    document.getElementById('new-table-number').focus();
  });
  document.getElementById('btn-cancel-new-order').addEventListener('click', () => {
    document.getElementById('new-order-form').classList.add('hidden');
    document.getElementById('new-table-number').value = '';
  });
  document.getElementById('btn-create-order').addEventListener('click', createNewOrder);
  document.getElementById('new-table-number').addEventListener('keydown', e => {
    if (e.key === 'Enter') createNewOrder();
  });
  document.getElementById('btn-close-order-detail').addEventListener('click', closeOrderDetail);

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuSelectorCategory = btn.dataset.cat;
      renderMenuSelectorList();
    });
  });

  document.getElementById('btn-checkout-order').addEventListener('click', () => {
    const oid = activeOrderId;
    closeOrderDetail();
    document.querySelector('[data-tab="checkout"]').click();
    setTimeout(() => { if (oid) openCheckoutModal(oid); }, 80);
  });
}

function createNewOrder() {
  const tableInput  = document.getElementById('new-table-number');
  const peopleInput = document.getElementById('new-people-count');
  const tableNumber = tableInput.value.trim();
  const people      = parseInt(peopleInput.value, 10) || 1;
  const customerType = document.querySelector('input[name="customer-type"]:checked').value;

  if (!tableNumber) {
    showToast('テーブル番号を入力してください');
    tableInput.focus();
    return;
  }
  const orders = loadOrders();
  if (orders.find(o => o.status === 'open' && o.tableNumber === tableNumber)) {
    showToast(`テーブル ${tableNumber} はすでにオープン中です`);
    return;
  }
  const newOrder = {
    id: genId(),
    tableNumber,
    people,
    customerType,
    items: [],
    status: 'open',
    createdAt: new Date().toISOString(),
    closedAt: null,
    total: 0,
    paymentMethod: null,
  };
  orders.push(newOrder);
  saveOrders(orders);
  tableInput.value = '';
  peopleInput.value = '1';
  document.getElementById('new-order-form').classList.add('hidden');
  renderOrdersList();
  showToast(`テーブル ${tableNumber} の伝票を作成しました`);
  openOrderDetail(newOrder.id);
}

// ===================================================
//   メニュー管理タブ
// ===================================================

function renderMenuList() {
  const menu = loadMenu();
  renderMenuCategory('menu-list-drink', menu.filter(m => m.category === 'ドリンク'));
  renderMenuCategory('menu-list-food',  menu.filter(m => m.category === 'フード'));
}

function renderMenuCategory(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:10px 0;">商品がありません</div>';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.innerHTML = `
      <div class="item-info">
        <div class="name">${escHtml(item.name)}</div>
        <div class="price">${formatPrice(item.price)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-icon edit" data-id="${item.id}">編集</button>
        <button class="btn-icon delete" data-id="${item.id}">削除</button>
      </div>
    `;
    card.querySelector('.btn-icon.edit').addEventListener('click',   () => openMenuEditForm(item.id));
    card.querySelector('.btn-icon.delete').addEventListener('click', () => deleteMenuItem(item.id));
    container.appendChild(card);
  });
}

function openMenuAddForm() {
  document.getElementById('menu-form-title').textContent = '商品追加';
  document.getElementById('menu-edit-id').value  = '';
  document.getElementById('menu-name').value     = '';
  document.getElementById('menu-price').value    = '';
  document.getElementById('menu-category').value = 'ドリンク';
  document.getElementById('menu-form').classList.remove('hidden');
  document.getElementById('menu-name').focus();
}

function openMenuEditForm(id) {
  const item = loadMenu().find(m => m.id === id);
  if (!item) return;
  document.getElementById('menu-form-title').textContent = '商品編集';
  document.getElementById('menu-edit-id').value  = id;
  document.getElementById('menu-name').value     = item.name;
  document.getElementById('menu-price').value    = item.price;
  document.getElementById('menu-category').value = item.category;
  document.getElementById('menu-form').classList.remove('hidden');
  document.getElementById('menu-name').focus();
}

function saveMenuForm() {
  const name    = document.getElementById('menu-name').value.trim();
  const priceStr= document.getElementById('menu-price').value.trim();
  const category= document.getElementById('menu-category').value;
  const editId  = document.getElementById('menu-edit-id').value;
  if (!name) { showToast('商品名を入力してください'); return; }
  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price < 0) { showToast('正しい価格を入力してください'); return; }
  const menu = loadMenu();
  if (editId) {
    const idx = menu.findIndex(m => m.id === editId);
    if (idx >= 0) { menu[idx] = { ...menu[idx], name, price, category }; showToast('商品を更新しました'); }
  } else {
    menu.push({ id: genId(), name, price, category });
    showToast('商品を追加しました');
  }
  saveMenu(menu);
  cancelMenuForm();
  renderMenuList();
}

function cancelMenuForm() {
  document.getElementById('menu-form').classList.add('hidden');
  document.getElementById('menu-edit-id').value = '';
  document.getElementById('menu-name').value    = '';
  document.getElementById('menu-price').value   = '';
}

function deleteMenuItem(id) {
  if (!confirm('この商品を削除しますか？')) return;
  saveMenu(loadMenu().filter(m => m.id !== id));
  renderMenuList();
  showToast('商品を削除しました');
}

function initMenuTab() {
  document.getElementById('btn-add-menu').addEventListener('click', openMenuAddForm);
  document.getElementById('btn-save-menu').addEventListener('click', saveMenuForm);
  document.getElementById('btn-cancel-menu').addEventListener('click', cancelMenuForm);
}

// ===================================================
//   お会計タブ
// ===================================================

let checkoutTargetOrderId = null;
let selectedPaymentMethod = '現金';

function renderCheckoutList() {
  const orders = loadOrders().filter(o => o.status === 'open');
  const container = document.getElementById('checkout-list');
  container.innerHTML = '';
  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">✅</span>会計待ちの伝票はありません</div>';
    return;
  }
  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const count = order.items.reduce((s, i) => s + i.quantity, 0);
    const typeBadge = order.customerType === '新規'
      ? '<span class="type-badge new-badge">新規</span>'
      : '<span class="type-badge return-badge">再来</span>';
    card.innerHTML = `
      <div class="checkout-badge">会計</div>
      <div class="table-label">テーブル ${typeBadge}</div>
      <div class="table-number">${escHtml(order.tableNumber)}</div>
      <div class="order-count">${order.people}名 / ${count} 品</div>
      <div class="order-total">${formatPrice(order.total)}</div>
      <div class="order-time">${formatTime(order.createdAt)} 〜</div>
    `;
    card.addEventListener('click', () => openCheckoutModal(order.id));
    container.appendChild(card);
  });
}

function openCheckoutModal(orderId) {
  if (!orderId) return;
  const order = loadOrders().find(o => o.id === orderId);
  if (!order) return;
  checkoutTargetOrderId = orderId;
  selectedPaymentMethod = '現金';

  const typeLabel = order.customerType === '新規'
    ? '<span class="type-badge new-badge">新規</span>'
    : '<span class="type-badge return-badge">再来</span>';
  document.getElementById('checkout-modal-table').innerHTML =
    `テーブル ${escHtml(order.tableNumber)} &nbsp;${order.people}名 &nbsp;${typeLabel}`;

  const itemsContainer = document.getElementById('checkout-modal-items');
  itemsContainer.innerHTML = '';
  order.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'checkout-item-row';
    row.innerHTML = `<span>${escHtml(item.name)} × ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)}</span>`;
    itemsContainer.appendChild(row);
  });
  document.getElementById('checkout-modal-total').textContent = formatPrice(order.total);
  document.getElementById('checkout-received').value = '';
  document.getElementById('checkout-change-row').classList.add('hidden');

  // 支払方法ボタン初期化
  document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.payment === '現金');
  });
  // 現金時のみお預かり欄を表示
  document.getElementById('checkout-received-row').classList.remove('hidden');

  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
  checkoutTargetOrderId = null;
  document.getElementById('checkout-modal').classList.add('hidden');
}

function confirmCheckout() {
  if (!checkoutTargetOrderId) return;
  const orders = loadOrders();
  const order = orders.find(o => o.id === checkoutTargetOrderId);
  if (!order) return;
  if (order.items.length === 0) { showToast('注文がありません'); return; }
  order.status        = 'closed';
  order.closedAt      = new Date().toISOString();
  order.paymentMethod = selectedPaymentMethod;
  saveOrders(orders);
  closeCheckoutModal();
  renderCheckoutList();
  showToast(`テーブル ${order.tableNumber} の会計が完了しました（${selectedPaymentMethod}）`);
}

function initCheckoutTab() {
  document.getElementById('btn-confirm-checkout').addEventListener('click', confirmCheckout);
  document.getElementById('btn-cancel-checkout').addEventListener('click', closeCheckoutModal);

  // 支払方法トグル
  document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPaymentMethod = btn.dataset.payment;
      // CL選択時はお預かり欄を非表示
      const isCash = selectedPaymentMethod === '現金';
      document.getElementById('checkout-received-row').classList.toggle('hidden', !isCash);
      document.getElementById('checkout-change-row').classList.add('hidden');
      if (!isCash) document.getElementById('checkout-received').value = '';
    });
  });

  // お釣り計算
  document.getElementById('checkout-received').addEventListener('input', () => {
    if (!checkoutTargetOrderId) return;
    const order = loadOrders().find(o => o.id === checkoutTargetOrderId);
    if (!order) return;
    const received = parseInt(document.getElementById('checkout-received').value, 10);
    const changeRow = document.getElementById('checkout-change-row');
    if (!isNaN(received) && received >= 0) {
      document.getElementById('checkout-change').textContent = formatPrice(Math.max(0, received - order.total));
      changeRow.classList.remove('hidden');
    } else {
      changeRow.classList.add('hidden');
    }
  });

  document.getElementById('checkout-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('checkout-modal')) closeCheckoutModal();
  });
}

// ===================================================
//   集計タブ（日報フォーマット）
// ===================================================

function initReports() {
  const dateInput  = document.getElementById('report-date');
  const monthInput = document.getElementById('report-month');
  if (!dateInput.value)  dateInput.value  = todayStr();
  if (!monthInput.value) monthInput.value = thisMonthStr();
  renderDailyReport();
}

// --- 日次レポート ---

function renderDailyReport() {
  const dateStr = document.getElementById('report-date').value;
  const orders  = loadOrders().filter(o => o.status === 'closed' && isoToDateStr(o.closedAt) === dateStr);
  const body    = document.getElementById('daily-report-body');

  const stats = calcStats(orders);
  const monthStr = dateStr.slice(0, 7);
  const monthOrders = loadOrders().filter(o => o.status === 'closed' && isoToMonthStr(o.closedAt) === monthStr);
  const mStats = calcStats(monthOrders);

  body.innerHTML = buildReportHTML(
    `■ 日報 — ${dateStrToJa(dateStr)}`,
    stats,
    `■ 月次累計 — ${monthStrToJa(monthStr)}`,
    mStats,
    orders
  );
}

// --- 月次レポート ---

function renderMonthlyReport() {
  const monthStr   = document.getElementById('report-month').value;
  const orders     = loadOrders().filter(o => o.status === 'closed' && isoToMonthStr(o.closedAt) === monthStr);
  const body       = document.getElementById('monthly-report-body');
  const stats      = calcStats(orders);

  // 日別内訳
  const byDay = {};
  orders.forEach(o => {
    const d = isoToDateStr(o.closedAt);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(o);
  });

  body.innerHTML = '';

  // サマリーブロック
  const summaryBlock = document.createElement('div');
  summaryBlock.className = 'report-block';
  summaryBlock.innerHTML = `
    <div class="report-block-title">${monthStrToJa(monthStr)} 月次集計</div>
    ${buildStatsTable(stats)}
  `;
  body.appendChild(summaryBlock);

  // 日別内訳
  if (Object.keys(byDay).length > 0) {
    const breakdownBlock = document.createElement('div');
    breakdownBlock.className = 'report-block';
    breakdownBlock.innerHTML = `<div class="report-block-title">日別内訳</div>`;
    const table = document.createElement('div');
    table.className = 'report-day-table';
    Object.keys(byDay).sort().forEach(d => {
      const ds = calcStats(byDay[d]);
      const row = document.createElement('div');
      row.className = 'report-day-row';
      const [, m, day] = d.split('-');
      row.innerHTML = `
        <span class="day">${parseInt(m,10)}/${parseInt(day,10)}</span>
        <span class="day-count">${ds.totalOrders}組 ${ds.totalPeople}名</span>
        <span class="day-cash">現金 ${formatPrice(ds.cash)}</span>
        <span class="day-cl">CL ${formatPrice(ds.cl)}</span>
        <span class="day-total">${formatPrice(ds.totalSales)}</span>
      `;
      table.appendChild(row);
    });
    breakdownBlock.appendChild(table);
    body.appendChild(breakdownBlock);
  } else {
    body.innerHTML += '<div class="empty-state" style="padding:30px 0;"><span class="empty-icon">📊</span>この月の売上データはありません</div>';
  }
}

// --- 集計ヘルパー ---

function calcStats(orders) {
  const totalSales  = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalPeople = orders.reduce((s, o) => s + (o.people || 1), 0);
  const newOrders   = orders.filter(o => o.customerType === '新規');
  const retOrders   = orders.filter(o => o.customerType !== '新規');
  const newPeople   = newOrders.reduce((s, o) => s + (o.people || 1), 0);
  const retPeople   = retOrders.reduce((s, o) => s + (o.people || 1), 0);
  const cash        = orders.filter(o => o.paymentMethod === '現金').reduce((s, o) => s + o.total, 0);
  const cl          = orders.filter(o => o.paymentMethod === 'CL').reduce((s, o) => s + o.total, 0);
  const unitPerGroup= totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const unitPerPerson= totalPeople > 0 ? Math.round(totalSales / totalPeople) : 0;
  return { totalSales, totalOrders, totalPeople, newOrders: newOrders.length, retOrders: retOrders.length, newPeople, retPeople, cash, cl, unitPerGroup, unitPerPerson };
}

function buildStatsTable(s) {
  return `
    <div class="report-stats-grid">
      <div class="rstat-block">
        <div class="rstat-section-title">■ 売上高</div>
        <div class="rstat-row main"><span>総売上</span><span class="rstat-val accent">${formatPrice(s.totalSales)}</span></div>
        <div class="rstat-row"><span>客単価（組）</span><span class="rstat-val">${formatPrice(s.unitPerGroup)}</span></div>
        <div class="rstat-row"><span>客単価（人数）</span><span class="rstat-val">${formatPrice(s.unitPerPerson)}</span></div>
      </div>
      <div class="rstat-block">
        <div class="rstat-section-title">■ 内訳</div>
        <div class="rstat-row"><span>現金</span><span class="rstat-val cash-val">${formatPrice(s.cash)}</span></div>
        <div class="rstat-row"><span>CL</span><span class="rstat-val cl-val">${formatPrice(s.cl)}</span></div>
      </div>
      <div class="rstat-block">
        <div class="rstat-section-title">■ 組数</div>
        <div class="rstat-row main"><span>累計</span><span class="rstat-val">${s.totalOrders} 組</span></div>
        <div class="rstat-row"><span>新規</span><span class="rstat-val new-val">${s.newOrders} 組</span></div>
        <div class="rstat-row"><span>再来</span><span class="rstat-val ret-val">${s.retOrders} 組</span></div>
      </div>
      <div class="rstat-block">
        <div class="rstat-section-title">■ 人数</div>
        <div class="rstat-row main"><span>累計</span><span class="rstat-val">${s.totalPeople} 名</span></div>
        <div class="rstat-row"><span>新規</span><span class="rstat-val new-val">${s.newPeople} 名</span></div>
        <div class="rstat-row"><span>再来</span><span class="rstat-val ret-val">${s.retPeople} 名</span></div>
      </div>
    </div>
  `;
}

function buildReportHTML(title1, stats1, title2, stats2, orders) {
  let html = `
    <div class="report-block">
      <div class="report-block-title">${title1}</div>
      ${buildStatsTable(stats1)}
    </div>
    <div class="report-block">
      <div class="report-block-title">${title2}</div>
      ${buildStatsTable(stats2)}
    </div>
  `;

  if (orders.length > 0) {
    html += `<div class="report-block"><div class="report-block-title">■ 本日の伝票一覧</div><div class="report-order-table">`;
    orders.sort((a,b) => new Date(a.closedAt) - new Date(b.closedAt)).forEach(o => {
      const count = o.items.reduce((s,i) => s + i.quantity, 0);
      const pmBadge = o.paymentMethod === 'CL'
        ? '<span class="pm-badge cl-badge">CL</span>'
        : '<span class="pm-badge cash-badge">現金</span>';
      const typeBadge = o.customerType === '新規'
        ? '<span class="type-badge new-badge">新規</span>'
        : '<span class="type-badge return-badge">再来</span>';
      html += `
        <div class="report-order-row">
          <span class="time">${formatTime(o.closedAt)}</span>
          <span class="table">TB: ${escHtml(o.tableNumber)}</span>
          <span class="ppl">${o.people}名 ${typeBadge}</span>
          <span class="cnt">${count}品</span>
          ${pmBadge}
          <span class="amount">${formatPrice(o.total)}</span>
        </div>
      `;
    });
    html += `</div></div>`;
  }
  return html;
}

function initReportsTab() {
  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.report-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.report;
      document.getElementById('report-daily').classList.toggle('hidden', type !== 'daily');
      document.getElementById('report-monthly').classList.toggle('hidden', type !== 'monthly');
    });
  });
  document.getElementById('report-date').addEventListener('change', renderDailyReport);
  document.getElementById('report-month').addEventListener('change', renderMonthlyReport);
}

// ===== XSS対策 =====

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===================================================
//   初期化
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  initDefaultMenu();
  initTabs();
  initOrdersTab();
  initMenuTab();
  initCheckoutTab();
  initReportsTab();
  renderOrdersList();
});
