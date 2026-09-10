import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ==============================
// Supabase 配置
// ==============================

const SUPABASE_URL = "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";

const ADMIN_UID = "adc53a79-71b3-4db6-800c-6f96aee5f304";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==============================
// 检查管理员身份
// ==============================

async function checkAdmin() {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        window.location.href = "index.html";
        return null;
    }

    if (data.user.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        alert("你没有管理员权限。");
        window.location.href = "index.html";
        return null;
    }

    return data.user;
}


// ==============================
// 登录页面
// ==============================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const loginButton =
            document.getElementById("login-button");

        const loginMessage =
            document.getElementById("login-message");


        loginButton.disabled = true;
        loginButton.textContent = "登录中...";
        loginMessage.textContent = "";


        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "登录失败：" + error.message;

            loginButton.disabled = false;
            loginButton.textContent = "登录后台";

            return;
        }


        // 检查 UID
        if (data.user.id !== ADMIN_UID) {

            await supabase.auth.signOut();

            loginMessage.textContent =
                "这个账号没有管理员权限。";

            loginButton.disabled = false;
            loginButton.textContent = "登录后台";

            return;
        }


        // 登录成功
        window.location.href = "dashboard.html";
    });
}


// ==============================
// 后台页面
// ==============================

const articleForm =
    document.getElementById("article-form");

if (articleForm) {

    checkAdmin();


    // ==========================
    // 发布文章
    // ==========================

    articleForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const title =
            document.getElementById("title").value.trim();

        const category =
            document.getElementById("category").value;

        const coverImage =
            document.getElementById("cover_image").value.trim();

        const content =
            document.getElementById("content").value;


        const publishButton =
            document.getElementById("publish-button");

        const publishMessage =
            document.getElementById("publish-message");


        publishButton.disabled = true;
        publishButton.textContent = "发布中...";
        publishMessage.textContent = "";


        // 再次确认管理员身份
        const user = await checkAdmin();

        if (!user) {
            return;
        }


        // 写入 Supabase articles
        const { error } = await supabase
            .from("articles")
            .insert({
                title: title,
                category: category,
                cover_image: coverImage,
                content: content
            });


        if (error) {

            console.error(error);

            publishMessage.textContent =
                "发布失败：" + error.message;

            publishButton.disabled = false;
            publishButton.textContent = "发布文章";

            return;
        }


        // 发布成功
        publishMessage.textContent =
            "文章发布成功！";

        articleForm.reset();

        publishButton.disabled = false;
        publishButton.textContent = "发布文章";
    });
}


// ==============================
// 退出登录
// ==============================

const logoutButton =
    document.getElementById("logout-button");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        await supabase.auth.signOut();

        window.location.href = "index.html";
    });
}
