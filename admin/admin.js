import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// ==========================================
// Supabase
// ==========================================

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";

const ADMIN_UID =
    "adc53a79-71b3-4db6-800c-6f96aee5f304";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// 管理员检查
// ==========================================

async function checkAdmin() {

    const {
        data,
        error
    } =
        await supabase.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "index.html";

        return null;
    }


    if (
        data.user.id !== ADMIN_UID
    ) {

        await supabase.auth.signOut();

        alert(
            "你没有管理员权限。"
        );

        window.location.href =
            "index.html";

        return null;
    }


    return data.user;
}


// ==========================================
// 登录
// ==========================================

const loginForm =
    document.getElementById(
        "login-form"
    );


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


            loginButton.disabled =
                true;


            loginButton.textContent =
                "登录中...";


            loginMessage.textContent =
                "";


            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                console.error(
                    error
                );


                loginMessage.textContent =
                    "登录失败：" +
                    error.message;


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "登录后台";


                return;
            }


            if (
                !data.user ||
                data.user.id !== ADMIN_UID
            ) {

                await supabase.auth.signOut();


                loginMessage.textContent =
                    "这个账号没有管理员权限。";


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "登录后台";


                return;
            }


            window.location.href =
                "dashboard.html";

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
// 显示图片上传状态
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
// 上传图片到 Supabase Storage
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


    // --------------------------------------
    // 文件扩展名
    // --------------------------------------

    let extension =
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


    // --------------------------------------
    // 文件名
    // --------------------------------------

    const fileName =
        `image-${crypto.randomUUID()}.${extension}`;


    // --------------------------------------
    // 文件路径
    // --------------------------------------

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


    // --------------------------------------
    // 上传
    // --------------------------------------

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


    // --------------------------------------
    // 获取公开 URL
    // --------------------------------------

    const {
        data
    } =
        supabase.storage
            .from("images")
            .getPublicUrl(
                filePath
            );


    const publicUrl =
        data.publicUrl;


    setImageMessage(
        imageNumber,
        "上传成功"
    );


    console.log(
        `图片 ${imageNumber}：`,
        publicUrl
    );


    return publicUrl;
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


            publishButton.disabled =
                true;


            publishButton.textContent =
                "发布中...";


            publishMessage.textContent =
                "";


            try {

                // ==================================
                // 再次检查管理员
                // ==================================

                const user =
                    await checkAdmin();


                if (!user) {
                    return;
                }


                // ==================================
                // 创建文章 ID
                // ==================================

                const articleId =
                    crypto.randomUUID();


                // ==================================
                // 上传图片
                // ==================================

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


                // ==================================
                // IMAGE_1
                // ==================================

                if (imageFiles[1]) {

                    imageUrls[1] =
                        await uploadImage(
                            imageFiles[1],
                            1,
                            articleId
                        );

                }


                // ==================================
                // IMAGE_2
                // ==================================

                if (imageFiles[2]) {

                    imageUrls[2] =
                        await uploadImage(
                            imageFiles[2],
                            2,
                            articleId
                        );

                }


                // ==================================
                // IMAGE_3
                // ==================================

                if (imageFiles[3]) {

                    imageUrls[3] =
                        await uploadImage(
                            imageFiles[3],
                            3,
                            articleId
                        );

                }


                // ==================================
                // 检查 HTML 中的图片占位符
                // ==================================

                if (
                    content.includes(
                        "{{IMAGE_1}}"
                    ) &&
                    !imageUrls[1]
                ) {

                    throw new Error(
                        "HTML 使用了 {{IMAGE_1}}，但你没有上传图片 1。"
                    );

                }


                if (
                    content.includes(
                        "{{IMAGE_2}}"
                    ) &&
                    !imageUrls[2]
                ) {

                    throw new Error(
                        "HTML 使用了 {{IMAGE_2}}，但你没有上传图片 2。"
                    );

                }


                if (
                    content.includes(
                        "{{IMAGE_3}}"
                    ) &&
                    !imageUrls[3]
                ) {

                    throw new Error(
                        "HTML 使用了 {{IMAGE_3}}，但你没有上传图片 3。"
                    );

                }


                // ==================================
                // 替换图片占位符
                // ==================================

                content =
                    content.replaceAll(
                        "{{IMAGE_1}}",
                        imageUrls[1]
                    );


                content =
                    content.replaceAll(
                        "{{IMAGE_2}}",
                        imageUrls[2]
                    );


                content =
                    content.replaceAll(
                        "{{IMAGE_3}}",
                        imageUrls[3]
                    );


                // ==================================
                // 写入数据库
                // ==================================

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


                // ==================================
                // 成功
                // ==================================

                publishMessage.textContent =
                    "文章发布成功！";


                articleForm.reset();


                setImageMessage(
                    1,
                    ""
                );


                setImageMessage(
                    2,
                    ""
                );


                setImageMessage(
                    3,
                    ""
                );


            } catch (error) {

                console.error(
                    "发布失败：",
                    error
                );


                publishMessage.textContent =
                    "发布失败：" +
                    error.message;

            }


            publishButton.disabled =
                false;


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
