import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ==============================
// Supabase 配置
// ==============================

const SUPABASE_URL = "你的_SUPABASE_URL";
const SUPABASE_ANON_KEY = "你的_SUPABASE_ANON_KEY";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==============================
// 登录
// ==============================

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "登录中...";
    loginMessage.textContent = "";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {

        console.error(error);

        loginMessage.textContent = "登录失败：" + error.message;

        loginButton.disabled = false;
        loginButton.textContent = "登录后台";

        return;
    }

    console.log("登录成功：", data.user);

    // 登录成功
    window.location.href = "dashboard.html";
});
