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


const supabase =
    createClient(
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

    console.log(
        "开始检查管理员登录状态..."
    );


    const {
        data,
        error
    } =
        await supabase.auth.getSession();


    if (error) {

        console.error(
            "获取 Session 失败:",
            error
        );


        window.location.href =
            "index.html";


        return null;

    }


    const session =
        data.session;


    console.log(
        "当前 Session:",
        session
    );


    if (
        !session ||
        !session.user
    ) {

        console.error(
            "当前没有登录 Session"
        );


        window.location.href =
            "index.html";


        return null;

    }


    console.log(
        "当前用户 UID:",
        session.user.id
    );


    // ======================================
    // 检查管理员 UID
    // ======================================

    if (
        session.user.id !== ADMIN_UID
    ) {

        console.error(
            "UID 不匹配"
        );


        await supabase.auth.signOut();


        alert(
            "你没有管理员权限。"
        );


        window.location.href =
            "index.html";


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


            try {

                console.log(
                    "正在登录:",
                    email
                );


                // ==================================
                // Supabase 登录
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

                    loginMessage.textContent =
                        "登录失败：" +
                        error.message;


                    console.error(
                        "Supabase 登录失败:",
                        error
                    );


                    return;

                }


                if (
                    !data ||
                    !data.user
                ) {

                    loginMessage.textContent =
                        "登录失败：没有获取到用户信息。";


                    return;

                }


                console.log(
                    "登录成功 UID:",
                    data.user.id
                );


                // ==================================
                // 管理员 UID
                // ==================================

                if (
                    data.user.id !== ADMIN_UID
                ) {

                    await supabase.auth.signOut();


                    loginMessage.textContent =
                        "这个账号没有管理员权限。";


                    console.error(
                        "UID 不匹配:",
                        data.user.id
                    );


                    return;

                }


                // ==================================
                // 检查 Session
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

                    loginMessage.textContent =
                        "登录成功，但 Session 保存失败。";


                    console.error(
                        "Session 错误:",
                        sessionError
                    );


                    return;

                }


                // ==================================
                // 登录成功
                // ==================================

                loginMessage.textContent =
                    "登录成功，正在进入后台...";


                console.log(
                    "准备进入 dashboard.html"
                );


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
                    "登录异常:",
                    error
                );


                loginMessage.textContent =
                    "登录发生错误：" +
                    error.message;

            } finally {

                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "登录后台";

            }

        }
    );

}


// ==========================================
// 动态图片系统
// ==========================================

let imageCount = 0;


const imageUploadList =
    document.getElementById(
        "image-upload-list"
    );


const addImageButton =
    document.getElementById(
        "add-image-button"
    );


// ==========================================
// 添加图片
// ==========================================

function addImageInput() {

    if (!imageUploadList) {
        return;
    }


    imageCount++;


    const number =
        imageCount;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "image-upload-item";


    item.dataset.imageNumber =
        number;


    item.innerHTML = `

        <div class="image-upload-header">

            <strong>
                图片 ${number}
            </strong>

            <button
                type="button"
                class="remove-image-button"
            >
                删除
            </button>

        </div>


        <input
            type="file"
            id="image_${number}"
            accept="image/jpeg,image/png,image/webp"
        >


        <p
            id="image_${number}_message"
            class="image-message"
        ></p>

    `;


    imageUploadList.appendChild(
        item
    );


    const removeButton =
        item.querySelector(
            ".remove-image-button"
        );


    removeButton.addEventListener(
        "click",
        () => {

            item.remove();

        }
    );

}


// ==========================================
// 添加图片按钮
// ==========================================

if (addImageButton) {

    addImageButton.addEventListener(
        "click",
        addImageInput
    );

}


// ==========================================
// 获取图片文件
// ==========================================

function getAllImageInputs() {

    if (!imageUploadList) {

        return [];

    }


    return Array.from(
        imageUploadList.querySelectorAll(
            'input[type="file"]'
        )
    );

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


    // ======================================
    // 检查格式
    // ======================================

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
            `图片 ${imageNumber} 格式不支持。`
        );

    }


    // ======================================
    // 生成文件名
    // ======================================

    const fileName =
        `image-${crypto.randomUUID()}.${extension}`;


    // ======================================
    // 日期
    // ======================================

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    // ======================================
    // Storage 路径
    // ======================================

    const filePath =
        `${year}/${month}/${articleId}/${fileName}`;


    console.log(
        "上传图片:",
        filePath
    );


    // ======================================
    // 上传
    // ======================================

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


    // ======================================
    // 获取公开 URL
    // ======================================

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


    console.log(
        `图片 ${imageNumber} URL:`,
        publicUrl
    );


    setImageMessage(
        imageNumber,
        "上传成功"
    );


    return publicUrl;

}


// ==========================================
// 文章发布
// ==========================================

const articleForm =
    document.getElementById(
        "article-form"
    );


if (articleForm) {

    // ======================================
    // 进入后台时检查管理员
    // ======================================

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
                // 生成文章 ID
                // ==================================

                const articleId =
                    crypto.randomUUID();


                console.log(
                    "文章 ID:",
                    articleId
                );


                // ==================================
                // 获取所有图片
                // ==================================

                const imageInputs =
                    getAllImageInputs();


                const imageUrls = {};


                // ==================================
                // 上传所有有选择文件的图片
                // ==================================

                for (
                    const input
                    of imageInputs
                ) {

                    const id =
                        input.id;


                    const number =
                        id.replace(
                            "image_",
                            ""
                        );


                    const file =
                        input.files[0];


                    if (!file) {

                        continue;

                    }


                    imageUrls[number] =
                        await uploadImage(
                            file,
                            number,
                            articleId
                        );

                }


                // ==================================
                // 找出 HTML 中使用的图片
                // ==================================

                const matches =
                    content.match(
                        /\{\{IMAGE_(\d+)\}\}/g
                    ) || [];


                const requiredImages =
                    [
                        ...new Set(

                            matches.map(
                                placeholder => {

                                    const match =
                                        placeholder.match(
                                            /\d+/
                                        );

                                    return match
                                        ? match[0]
                                        : null;

                                }
                            )

                        )
                    ].filter(Boolean);


                console.log(
                    "HTML 使用的图片:",
                    requiredImages
                );


                // ==================================
                // 检查图片是否全部上传
                // ==================================

                for (
                    const number
                    of requiredImages
                ) {

                    if (
                        !imageUrls[number]
                    ) {

                        throw new Error(
                            `HTML 使用了 {{IMAGE_${number}}}，但没有上传图片 ${number}。`
                        );

                    }

                }


                // ==================================
                // 替换图片占位符
                // ==================================

                for (
                    const number
                    of requiredImages
                ) {

                    content =
                        content.replaceAll(
                            `{{IMAGE_${number}}}`,
                            imageUrls[number]
                        );

                }


                // ==================================
                // 获取封面图
                // ==================================

                const coverImage =
                    imageUrls["1"] || "";


                // ==================================
                // 写入 articles
                // ==================================

                console.log(
                    "正在写入 articles..."
                );


                const {
                    error: insertError
                } =
                    await supabase
                        .from("articles")
                        .insert({

                            title: title,

                            category: category,

                            cover_image:
                                coverImage,

                            content: content

                        });


                if (insertError) {

                    throw insertError;

                }


                // ==================================
                // 发布成功
                // ==================================

                publishMessage.textContent =
                    "文章发布成功！";


                console.log(
                    "文章发布成功"
                );


                // ==================================
                // 清空表单
                // ==================================

                articleForm.reset();


                // ==================================
                // 清空图片
                // ==================================

                if (imageUploadList) {

                    imageUploadList.innerHTML =
                        "";

                }


                imageCount =
                    0;

            } catch (error) {

                console.error(
                    "发布失败:",
                    error
                );


                publishMessage.textContent =
                    "发布失败：" +
                    error.message;

            } finally {

                publishButton.disabled =
                    false;


                publishButton.textContent =
                    "发布文章";

            }

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

            try {

                await supabase.auth.signOut();

            } finally {

                window.location.href =
                    "index.html";

            }

        }
    );

}
