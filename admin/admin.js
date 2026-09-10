import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// ==============================
// Supabase 配置
// ==============================

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";

const ADMIN_UID =
    "adc53a79-71b3-4db6-800c-6f96aee5f304";


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==============================
// 检查管理员身份
// ==============================

async function checkAdmin() {

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();


    if (error || !user) {

        console.log("没有登录用户");

        window.location.href = "index.html";

        return null;
    }


    console.log("当前登录 UID：", user.id);


    if (user.id !== ADMIN_UID) {

        await supabase.auth.signOut();

        alert("你没有管理员权限。");

        window.location.href = "index.html";

        return null;
    }


    return user;
}


// ==============================
// 登录页面
// ==============================

const loginForm =
    document.getElementById("login-form");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const loginButton =
                document
                    .getElementById("login-button");


            const loginMessage =
                document
                    .getElementById("login-message");


            loginButton.disabled = true;

            loginButton.textContent =
                "登录中...";

            loginMessage.textContent = "";


            // ==============================
            // Supabase 登录
            // ==============================

            const {
                data,
                error
            } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            // ==============================
            // 登录失败
            // ==============================

            if (error) {

                console.error(
                    "登录错误：",
                    error
                );


                loginMessage.textContent =
                    "登录失败：" +
                    error.message;


                loginButton.disabled = false;

                loginButton.textContent =
                    "登录后台";

                return;
            }


            console.log(
                "登录成功 UID：",
                data.user?.id
            );


            // ==============================
            // 检查管理员 UID
            // ==============================

            if (
                !data.user ||
                data.user.id !== ADMIN_UID
            ) {

                await supabase.auth.signOut();


                loginMessage.textContent =
                    "这个账号没有管理员权限。";


                loginButton.disabled = false;

                loginButton.textContent =
                    "登录后台";

                return;
            }


            // ==============================
            // 登录成功
            // ==============================

            loginMessage.textContent =
                "登录成功，正在进入后台...";


            // 稍微等待 Supabase 保存 session
            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 300);

        }
    );
}


// ==============================
// 后台页面
// ==============================

const articleForm =
    document.getElementById("article-form");


if (articleForm) {

    // 页面打开时检查管理员
    checkAdmin();


    // ==============================
    // 发布文章
    // ==============================

    articleForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            const content =
                document
                    .getElementById("content")
                    .value;


            const publishButton =
                document
                    .getElementById("publish-button");


            const publishMessage =
                document
                    .getElementById("publish-message");


            publishButton.disabled = true;

            publishButton.textContent =
                "发布中...";

            publishMessage.textContent = "";


            // ==============================
            // 再次确认管理员
            // ==============================

            const user =
                await checkAdmin();


            if (!user) {

                return;
            }


            // ==============================
            // 保存文章
            // ==============================

            const {
                error
            } =
                await supabase
                    .from("articles")
                    .insert({

                        title: title,

                        category: category,

                        // 现在不再单独上传封面
                        cover_image: "",

                        // 保存完整 HTML
                        content: content

                    });


            // ==============================
            // 保存失败
            // ==============================

            if (error) {

                console.error(
                    "发布失败：",
                    error
                );


                publishMessage.textContent =
                    "发布失败：" +
                    error.message;


                publishButton.disabled = false;

                publishButton.textContent =
                    "发布文章";

                return;
            }


            // ==============================
            // 发布成功
            // ==============================

            publishMessage.textContent =
                "文章发布成功！";


            articleForm.reset();


            publishButton.disabled = false;

            publishButton.textContent =
                "发布文章";

        }
    );
}


// ==============================
// 退出登录
// ==============================

const logoutButton =
    document.getElementById("logout-button");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabase.auth.signOut();

            window.location.href =
                "index.html";

        }
    );
}
