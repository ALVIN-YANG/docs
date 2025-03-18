// 定义环境变量
const env = "local"; // 或者 'test'，'prod'

// 根据环境定义配置
const envConfig = {
  local: {
    loginUrl: "http://localhost:8001/user/login",
    validateTokenUrl: "http://localhost:8080/api/user/validateToken",
  },
  test: {
    loginUrl: "http://test.login.com/Console/login",
    validateTokenUrl: "http://test.api.com/api/validateToken",
  },
  prod: {
    loginUrl: "http://prod.login.com/Console/login",
    validateTokenUrl: "http://prod.api.com/api/validateToken",
  },
};

// 验证状态
let isTokenValidated = false;

// 获取当前环境的配置
const config = envConfig[env];

// 获取当前页面域名
const currentPageDomain = window.location.origin;

// 获取 URL 中的 Token 参数
function getUrlToken() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("token");
}

// 从 localStorage 中获取 Token
function getLocalStorageToken() {
  return localStorage.getItem("token");
}

// 校验 Token 的接口调用 (需要您替换为实际的接口地址和实现)
async function validateToken(token) {
  try {
    const response = await fetch(config.validateTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 通常使用 Authorization 头传递 Token
      },
      body: JSON.stringify({ token: token }), // 或者根据您的接口要求传递 Token
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success) {
        // 接口返回 { success: true } 表示验证成功
        return true;
      }
    }
    return false; // 接口调用失败或验证失败
  } catch (error) {
    console.error("Token 校验失败:", error);
    return false; // 网络错误或接口调用异常
  }
}

// 重定向到登录页面
function redirectToLogin() {
  // 获取当前页面的完整路径并进行 URL 编码
  const redirectUrl = encodeURIComponent(window.location.href);
  const loginUrlWithRedirect = `${config.loginUrl}?redirect=${redirectUrl}&isCros=true`;
  window.location.href = loginUrlWithRedirect;
}

// 移除URL中的token参数
function removeUrlToken() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("token")) {
    urlParams.delete("token");
    const newUrl =
      window.location.pathname +
      (urlParams.toString() ? `?${urlParams}` : "") +
      window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
}

// 主逻辑
async function main() {
  let token = getUrlToken(); // 优先从 URL 获取 Token
  if (!token) {
    token = getLocalStorageToken(); // 如果 URL 中没有，则从 localStorage 获取
  }
  if (!token) {
    redirectToLogin(); // 如果没有 Token，重定向到登录页面
    return;
  }
  // 如果 Token 已经验证过，则直接返回
  if (isTokenValidated) {
    removeUrlToken();
    return;
  }
  const isValid = await validateToken(token); // 校验 Token

  if (isValid) {
    localStorage.setItem("token", token);
    isTokenValidated = true;
    removeUrlToken();
  } else {
    redirectToLogin(); // 验证失败，重定向到登录页面
  }
}

// main();
