import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// ==========================================
// Supabase 配置
// ==========================================

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";

const ADMIN_UID =
    "adc53a79-71b3-4db6-800c-6f96aee5f304";


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);


// ==========================================
// 管理员检查
// ==========================================

async function checkAdmin() {

    console.log("开始检查管理员登录状态...");

    const {
        data: {
            session
        },
        error: sessionError
    } = await supabase.auth.getSession();


    console.log("Session:", session);
    console.log("Session Error:", sessionError);


    if (sessionError) {

        console.error(
            "获取 Session 失败:",
            sessionError
        );

        window.location.href = "index.html";

        return null;
    }


    if (!session || !session.user) {

        console.error(
            "当前没有登录 Session"
        );

        window.location.href = "index.html";

        return null;
    }


    console.log(
        "当前用户 UID:",
        session.user.id
    );


    // ==========================================
    // 检查管理员 UID
    // ==========================================

    if (session.user.id !== ADMIN_UID) {

        console.error(
            "UID 不匹配:",
            session.user.id
        );

        await supabase.auth.signOut();

        alert("你没有管理员权限。");

        window.location.href = "index.html";

        return null;
    }


    console.log(
        "管理员验证成功"
    );

    return session.user;
}


// ==========================================
// 登录
// ==========================================

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
                document.getElementById(
                    "login-button"
                );


            const loginMessage =
                document.getElementById(
                    "login-message"
                );


            loginButton.disabled = true;

            loginButton.textContent =
                "登录中...";

            loginMessage.textContent = "";


            console.log(
                "正在登录:",
                email
            );


            try {

                // ==================================
                // 登录
                // ==================================

                const {
                    data,
                    error
                } =
                    await supabase.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                console.log(
                    "登录返回:",
                    data
                );

                console.log(
                    "登录错误:",
                    error
                );


                if (error) {

                    console.error(
                        "Supabase 登录失败:",
                        error
                    );

                    loginMessage.textContent =
                        "登录失败：" +
                        error.message;

                    return;
                }


                // ==================================
                // 检查用户
                // ==================================

                if (!data || !data.user) {

                    loginMessage.textContent =
                        "登录失败：没有获取到用户信息。";

                    return;
                }


                console.log(
                    "登录成功 UID:",
                    data.user.id
                );


                // ==================================
                // 检查管理员 UID
                // ==================================

                if (
                    data.user.id !== ADMIN_UID
                ) {

                    console.error(
                        "UID 不匹配",
                        {
                            登录用户: data.user.id,
                            管理员UID: ADMIN_UID
                        }
                    );


                    await supabase.auth.signOut();


                    loginMessage.textContent =
                        "这个账号没有管理员权限。";

                    return;
                }


                // ==================================
                // 确认 Session
                // ==================================

                const {
                    data: sessionData,
                    error: sessionError
                } =
                    await supabase.auth.getSession();


                console.log(
                    "登录后的 Session:",
                    sessionData
                );


                if (
                    sessionError ||
                    !sessionData.session
                ) {

                    console.error(
                        "登录成功，但是没有 Session:",
                        sessionError
                    );

                    loginMessage.textContent =
                        "登录成功，但 Session 保存失败。";

                    return;
                }


                // ==================================
                // 登录完成
                // ==================================

                loginMessage.textContent =
                    "登录成功，正在进入后台...";


                console.log(
                    "准备进入 dashboard.html"
                );


                // 稍微等待一下，确保 Session 写入
                setTimeout(
                    () => {

                        window.location.replace(
                            "dashboard.html"
                        );

                    },
                    300
                );

            } catch (error) {

                console.error(
                    "登录发生异常:",
                    error
                );


                loginMessage.textContent =
                    "登录发生错误：" +
                    error.message;

            } finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "登录后台";

            }

        }
    );
}


// ==========================================
// 获取图片文件
// ==========================================

function getImageFile(number) {

    const input =
        document.getElementById(
            `image_${number}`
        );


    if (!input) {
        return null;
    }


    return input.files[0] || null;
}


// ==========================================
// 图片上传状态
// ==========================================

function setImageMessage(
    number,
    message
) {

    const element =
        document.getElementById(
            `image_${number}_message`
        );


    if (element) {

        element.textContent =
            message;

    }
}


// ==========================================
// 上传图片
// ==========================================

async function uploadImage(
    file,
    imageNumber,
    articleId
) {

    if (!file) {
        return "";
    }


    setImageMessage(
        imageNumber,
        "正在上传..."
    );


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension !== "jpg" &&
        extension !== "jpeg" &&
        extension !== "png" &&
        extension !== "webp"
    ) {

        throw new Error(
            `图片 ${imageNumber} 格式不支持`
        );

    }


    const fileName =
        `image-${crypto.randomUUID()}.${extension}`;


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const filePath =
        `${year}/${month}/${articleId}/${fileName}`;


    const {
        error: uploadError
    } =
        await supabase.storage
            .from("images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const {
        data
    } =
        supabase.storage
            .from("images")
            .getPublicUrl(
                filePath
            );


    setImageMessage(
        imageNumber,
        "上传成功"
    );


    return data.publicUrl;
}


// ==========================================
// 发布文章
// ==========================================

const articleForm =
    document.getElementById(
        "article-form"
    );


if (articleForm) {

    checkAdmin();


    articleForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const publishButton =
                document.getElementById(
                    "publish-button"
                );


            const publishMessage =
                document.getElementById(
                    "publish-message"
                );


            const title =
                document
                    .getElementById("title")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value;


            let content =
                document
                    .getElementById("content")
                    .value;


            publishButton.disabled = true;

            publishButton.textContent =
                "发布中...";

            publishMessage.textContent = "";


            try {

                const user =
                    await checkAdmin();


                if (!user) {
                    return;
                }


                const articleId =
                    crypto.randomUUID();


                const imageFiles = {

                    1: getImageFile(1),

                    2: getImageFile(2),

                    3: getImageFile(3)

                };


                const imageUrls = {

                    1: "",

                    2: "",

                    3: ""

                };


                for (const number of [1, 2, 3]) {

                    if (imageFiles[number]) {

                        imageUrls[number] =
                            await uploadImage(
                                imageFiles[number],
                                number,
                                articleId
                            );

                    }

                }


                for (const number of [1, 2, 3]) {

                    const placeholder =
                        `{{IMAGE_${number}}}`;


                    if (
                        content.includes(
                            placeholder
                        ) &&
                        !imageUrls[number]
                    ) {

                        throw new Error(
                            `HTML 使用了 ${placeholder}，但你没有上传图片 ${number}。`
                        );

                    }


                    content =
                        content.replaceAll(
                            placeholder,
                            imageUrls[number]
                        );

                }


                const {
                    error
                } =
                    await supabase
                        .from("articles")
                        .insert({

                            title: title,

                            category: category,

                            cover_image:
                                imageUrls[1] || "",

                            content: content

                        });


                if (error) {

                    throw error;

                }


                publishMessage.textContent =
                    "文章发布成功！";


                articleForm.reset();


                setImageMessage(1, "");
                setImageMessage(2, "");
                setImageMessage(3, "");

            } catch (error) {

                console.error(
                    "发布失败:",
                    error
                );


                publishMessage.textContent =
                    "发布失败：" +
                    error.message;

            }


            publishButton.disabled = false;

            publishButton.textContent =
                "发布文章";

        }
    );
}


// ==========================================
// 退出登录
// ==========================================

const logoutButton =
    document.getElementById(
        "logout-button"
    );


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
