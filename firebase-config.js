// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCV4zMfbBwY4jT_qiRLzIAa76dMMH7Ayng",
  authDomain: "coffeesalesdata.firebaseapp.com",
  projectId: "coffeesalesdata",
  storageBucket: "coffeesalesdata.firebasestorage.app",
  messagingSenderId: "678537310070",
  appId: "1:678537310070:web:9d455614e312cf9356d457",
  measurementId: "G-EQCE557XHD"
};

// 全局变量
let app = null;
let db = null;
let salesCollection = null;

// 初始化 Firebase
async function initializeFirebase() {
  try {
    console.log('开始初始化 Firebase...');
    
    // 检查 Firebase SDK 是否已加载
    if (!window.firebaseModules) {
      throw new Error('Firebase SDK 未加载，请检查网络连接');
    }
    
    const { 
      initializeApp,
      getFirestore,
      collection,
      query,
      orderBy,
      limit,
      getDocs
    } = window.firebaseModules;
    
    // 初始化应用
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase 应用初始化成功');
    }
    
    // 初始化 Firestore
    if (!db) {
      db = getFirestore(app);
      console.log('Firestore 初始化成功');
    }
    
    // 初始化集合引用
    if (!salesCollection) {
      salesCollection = collection(db, 'salesData');
      console.log('销售数据集合已初始化');
    }
    
    // 测试集合访问
    const testQuery = query(salesCollection, limit(1));
    const testSnapshot = await getDocs(testQuery);
    console.log('集合访问测试成功，记录数:', testSnapshot.size);
    
    return true;
  } catch (error) {
    console.error('Firebase 初始化过程中出错:', error);
    throw error;
  }
}

// 设置实时数据监听
function setupRealtimeListener(callback) {
  try {
    console.log('设置实时数据监听...');
    
    const {
      query,
      orderBy,
      onSnapshot
    } = window.firebaseModules;
    
    if (!salesCollection) {
      throw new Error('销售数据集合未初始化');
    }
    
    // 创建查询
    const q = query(salesCollection, orderBy('date', 'desc'));
    
    // 设置监听器
    return onSnapshot(q,
      snapshot => {
        console.log('收到实时数据更新:', snapshot.size + '条记录');
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      },
      error => {
        console.error('实时数据监听错误:', error);
        if (typeof window.appShowNotification === 'function') {
          window.appShowNotification('数据同步失败: ' + error.message, 'error');
        }
      }
    );
  } catch (error) {
    console.error('设置数据监听失败:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('无法设置数据监听: ' + error.message, 'error');
    }
    return null;
  }
}

// 获取所有销售数据
async function fetchSalesData() {
  try {
    const {
      query,
      orderBy,
      getDocs
    } = window.firebaseModules;
    
    if (!salesCollection) {
      throw new Error('销售数据集合未初始化');
    }
    
    const q = query(salesCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('获取数据时发生错误:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('获取数据失败: ' + error.message, 'error');
    }
    return [];
  }
}

// 添加销售记录
async function addSalesRecord(record) {
  try {
    const { addDoc } = window.firebaseModules;
    
    if (!salesCollection) {
      throw new Error('销售数据集合未初始化');
    }
    
    const docRef = await addDoc(salesCollection, record);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('数据添加成功！');
    }
    return docRef.id;
  } catch (error) {
    console.error('添加数据时发生错误:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('添加数据失败: ' + error.message, 'error');
    }
    return null;
  }
}

// 更新销售记录
async function updateSalesRecord(id, updatedRecord) {
  try {
    const { doc, updateDoc } = window.firebaseModules;
    
    if (!db || !salesCollection) {
      throw new Error('销售数据集合未初始化');
    }
    
    const docRef = doc(db, 'salesData', id);
    await updateDoc(docRef, updatedRecord);
    
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('数据更新成功！');
    }
    return true;
  } catch (error) {
    console.error('更新数据时发生错误:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('更新数据失败: ' + error.message, 'error');
    }
    return false;
  }
}

// 删除销售记录
async function deleteSalesRecord(id) {
  try {
    const { doc, deleteDoc } = window.firebaseModules;
    
    if (!db || !salesCollection) {
      throw new Error('销售数据集合未初始化');
    }
    
    const docRef = doc(db, 'salesData', id);
    await deleteDoc(docRef);
    
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('数据删除成功！');
    }
    return true;
  } catch (error) {
    console.error('删除数据时发生错误:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('删除数据失败: ' + error.message, 'error');
    }
    return false;
  }
}

// 显示通知
function showNotification(message, type = 'info') {
  console.log(`[通知 - ${type}]:`, message);
  
  if (typeof window.appShowNotification === 'function') {
    window.appShowNotification(message, type);
    return;
  }
  
  if (type === 'error') {
    alert('错误: ' + message);
  }
}

// 初始化应用
window.addEventListener('load', async () => {
  console.log('页面加载完成，开始初始化 Firebase...');
  try {
    await initializeFirebase();
    console.log('Firebase 初始化成功');
  } catch (error) {
    console.error('Firebase 初始化失败:', error);
    if (typeof window.appShowNotification === 'function') {
      window.appShowNotification('初始化失败: ' + error.message, 'error');
    }
  }
}); 