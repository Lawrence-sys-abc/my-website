import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ==============================
// Supabase 配置
// ==============================

const SUPABASE_URL = "https://lyfdqypsivxthrydwktx.supabase.co";

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

    const { data, error } =
        await supabase.auth.getUser();

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

const loginForm =
    document.getElementById("login-form");

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


        // ==========================
        // 检查管理员 UID
        // ==========================

        if (data.user.id !== ADMIN_UID) {

            await supabase.auth.signOut();

            loginMessage.textContent =
                "这个账号没有管理员权限。";

            loginButton.disabled = false;
            loginButton.textContent = "登录后台";

            return;
        }


        // ==========================
        // 登录成功
        // ==========================

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


        // ==========================
        // 获取表单内容
        // ==========================

        const title =
            document.getElementById("title")
                .value
                .trim();

        const category =
            document.getElementById("category")
                .value;

        const coverImageFile =
            document.getElementById("cover_image")
                .files[0];

        const content =
            document.getElementById("content")
                .value;


        const publishButton =
            document.getElementById("publish-button");

        const publishMessage =
            document.getElementById("publish-message");


        publishButton.disabled = true;
        publishButton.textContent = "发布中...";
        publishMessage.textContent = "";


        // ==========================
        // 再次确认管理员身份
        // ==========================

        const user =
            await checkAdmin();

        if (!user) {

            return;
        }


        // ==========================
        // 上传封面图片
        // ==========================

        let coverImage = "";


        if (coverImageFile) {

            // 获取文件扩展名
            const fileExtension =
                coverImageFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            // 创建文章 UUID
            const articleId =
                crypto.randomUUID();


            // 创建唯一文件名
            const fileName =
                `cover-${crypto.randomUUID()}.${fileExtension}`;


            // 获取当前日期
            const now =
                new Date();

            const year =
                now.getFullYear();

            const month =
                String(now.getMonth() + 1)
                    .padStart(2, "0");


            // Storage 文件路径
            const filePath =
                `${year}/${month}/${articleId}/${fileName}`;


            // ==========================
            // 上传到 Supabase Storage
            // ==========================

            const { error: uploadError } =
                await supabase.storage
                    .from("images")
                    .upload(
                        filePath,
                        coverImageFile,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(uploadError);

                publishMessage.textContent =
                    "图片上传失败：" +
                    uploadError.message;

                publishButton.disabled = false;
                publishButton.textContent = "发布文章";

                return;
            }


            // ==========================
            // 获取公开图片 URL
            // ==========================

            const { data: publicUrlData } =
                supabase.storage
                    .from("images")
                    .getPublicUrl(filePath);


            coverImage =
                publicUrlData.publicUrl;


            console.log(
                "图片上传成功：",
                coverImage
            );
        }


        // ==========================
        // 写入 articles 数据表
        // ==========================

        const { error } =
            await supabase
                .from("articles")
                .insert({

                    title: title,

                    category: category,

                    cover_image: coverImage,

                    content: content

                });


        // ==========================
        // 数据库写入失败
        // ==========================

        if (error) {

            console.error(error);

            publishMessage.textContent =
                "发布失败：" +
                error.message;

            publishButton.disabled = false;
            publishButton.textContent = "发布文章";

            return;
        }


        // ==========================
        // 发布成功
        // ==========================

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
