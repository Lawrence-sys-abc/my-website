/* =========================================================
   Bloomberg New 管理员后台
   Supabase
========================================================= */


/* =========================================================
   Supabase
   使用 esm.sh，确保浏览器可以正常导入 createClient
========================================================= */

import {
    createClient
} from "https://esm.sh/@supabase/supabase-js@2";


/* =========================================================
   Supabase 配置
========================================================= */

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";

const ADMIN_UID =
    "adc53a79-71b3-4db6-800c-6f96aee5f304";


/* =========================================================
   创建 Supabase 客户端
========================================================= */

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


console.log(
    "Supabase 初始化成功"
);


/* =========================================================
   获取页面元素
========================================================= */

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");

const loginButton =
    document.getElementById("login-button");

const logoutButton =
    document.getElementById("logout-button");

const publishButton =
    document.getElementById("publish-button");

const publishMessage =
    document.getElementById("publish-message");

const addImageButton =
    document.getElementById("add-image-button");

const imageUploadList =
    document.getElementById("image-upload-list");


/* =========================================================
   检查管理员
========================================================= */

async function checkAdmin() {

    try {

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

            return false;
        }


        const session =
            data?.session;


        if (!session) {

            console.log(
                "当前没有登录 Session"
            );

            return false;
        }


        const user =
            session.user;


        console.log(
            "当前登录 UID:",
            user.id
        );


        if (user.id !== ADMIN_UID) {

            console.error(
                "当前账号不是管理员:",
                user.id
            );

            await supabase.auth.signOut();

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "检查管理员失败:",
            error
        );

        return false;
    }
}


/* =========================================================
   登录
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

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


            if (!email || !password) {

                loginMessage.textContent =
                    "请输入邮箱和密码";

                return;
            }


            loginButton.disabled =
                true;

            loginButton.textContent =
                "登录中...";

            loginMessage.textContent =
                "";


            console.log(
                "正在登录:",
                email
            );


            try {

                const {
                    data,
                    error
                } =
                    await supabase.auth.signInWithPassword(
                        {
                            email,
                            password
                        }
                    );


                console.log(
                    "登录返回:",
                    data,
                    error
                );


                if (error) {

                    console.error(
                        "登录错误:",
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


                const user =
                    data?.user;


                if (!user) {

                    loginMessage.textContent =
                        "登录失败：没有获取到用户信息";

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "登录后台";

                    return;
                }


                console.log(
                    "登录成功 UID:",
                    user.id
                );


                /* =================================================
                   检查管理员 UID
                ================================================= */

                if (
                    user.id !== ADMIN_UID
                ) {

                    console.error(
                        "UID 不匹配",
                        {
                            当前UID: user.id,
                            管理员UID: ADMIN_UID
                        }
                    );


                    await supabase.auth.signOut();


                    loginMessage.textContent =
                        "这个账号没有管理员权限";


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "登录后台";


                    return;
                }


                /* =================================================
                   检查 Session
                ================================================= */

                const {
                    data: sessionData
                } =
                    await supabase.auth.getSession();


                console.log(
                    "登录后的 Session:",
                    sessionData
                );


                if (
                    !sessionData?.session
                ) {

                    loginMessage.textContent =
                        "登录成功，但 Session 保存失败，请重新登录";


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "登录后台";


                    return;
                }


                console.log(
                    "管理员验证成功"
                );


                loginMessage.textContent =
                    "登录成功，正在进入后台...";


                /* =================================================
                   进入 Dashboard
                ================================================= */

                window.location.href =
                    "/admin/dashboard.html";

            } catch (error) {

                console.error(
                    "登录发生异常:",
                    error
                );


                loginMessage.textContent =
                    "登录发生异常：" +
                    error.message;


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "登录后台";

            }

        }
    );

}


/* =========================================================
   Dashboard 初始化
========================================================= */

if (publishButton) {

    initializeDashboard();

}


async function initializeDashboard() {

    console.log(
        "正在检查管理员登录状态..."
    );


    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {

        console.log(
            "没有管理员权限，返回登录页面"
        );


        window.location.href =
            "/admin/index.html";


        return;
    }


    console.log(
        "管理员验证成功，进入后台"
    );


    setupImageUploader();

}


/* =========================================================
   图片上传系统
========================================================= */

function setupImageUploader() {

    if (!imageUploadList) {
        return;
    }


    if (addImageButton) {

        addImageButton.addEventListener(
            "click",
            function () {

                addImageInput();

            }
        );

    }

}


/* =========================================================
   添加图片上传框
========================================================= */

function addImageInput() {

    const currentItems =
        imageUploadList.querySelectorAll(
            ".image-upload-item"
        );


    const imageNumber =
        currentItems.length + 1;


    const item =
        document.createElement("div");


    item.className =
        "image-upload-item";


    item.dataset.imageNumber =
        imageNumber;


    item.innerHTML = `

        <div class="image-input-top">

            <label>
                图片 ${imageNumber}
            </label>

            <button
                type="button"
                class="remove-image-button"
            >
                删除
            </button>

        </div>

        <input
            type="file"
            class="article-image-input"
            accept="image/*"
        >

        <p class="image-placeholder">
            HTML 中使用：
            <code>{{IMAGE_${imageNumber}}}</code>
        </p>

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
        function () {

            item.remove();

            renumberImageInputs();

        }
    );

}


/* =========================================================
   图片重新编号
========================================================= */

function renumberImageInputs() {

    const items =
        imageUploadList.querySelectorAll(
            ".image-upload-item"
        );


    items.forEach(
        function (item, index) {

            const number =
                index + 1;


            item.dataset.imageNumber =
                number;


            const label =
                item.querySelector(
                    "label"
                );


            if (label) {

                label.textContent =
                    `图片 ${number}`;

            }


            const placeholder =
                item.querySelector(
                    ".image-placeholder"
                );


            if (placeholder) {

                placeholder.innerHTML =
                    `
                    HTML 中使用：
                    <code>{{IMAGE_${number}}}</code>
                    `;

            }

        }
    );

}


/* =========================================================
   获取图片输入框
========================================================= */

function getImageInputs() {

    if (!imageUploadList) {

        return [];

    }


    return Array.from(
        imageUploadList.querySelectorAll(
            ".article-image-input"
        )
    );

}


/* =========================================================
   上传图片到 Supabase Storage
========================================================= */

async function uploadImage(
    file,
    imageNumber
) {

    if (!file) {

        return null;

    }


    const extension =
        file.name.includes(".")
            ? file.name
                .split(".")
                .pop()
                .toLowerCase()
            : "jpg";


    const fileName =
        `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;


    const filePath =
        `articles/${fileName}`;


    console.log(
        `开始上传图片 ${imageNumber}:`,
        filePath
    );


    const {
        error
    } =
        await supabase
            .storage
            .from("images")
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false
                }
            );


    if (error) {

        console.error(
            "图片上传失败:",
            error
        );


        throw new Error(
            `图片 ${imageNumber} 上传失败：${error.message}`
        );

    }


    const {
        data
    } =
        supabase
            .storage
            .from("images")
            .getPublicUrl(
                filePath
            );


    if (!data?.publicUrl) {

        throw new Error(
            `图片 ${imageNumber} 上传成功，但无法获取图片地址`
        );

    }


    console.log(
        `图片 ${imageNumber} URL:`,
        data.publicUrl
    );


    return data.publicUrl;

}


/* =========================================================
   发布文章
========================================================= */

if (publishButton) {

    publishButton.addEventListener(
        "click",
        async function () {

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
                    .value
                    .trim();


            /* =========================
               基础检查
            ========================== */

            if (!title) {

                showPublishMessage(
                    "请输入文章标题",
                    true
                );

                return;

            }


            if (!content) {

                showPublishMessage(
                    "请输入文章 HTML 内容",
                    true
                );

                return;

            }


            /* =========================
               管理员检查
            ========================== */

            const isAdmin =
                await checkAdmin();


            if (!isAdmin) {

                showPublishMessage(
                    "登录状态已失效，请重新登录",
                    true
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "/admin/index.html";

                    },
                    1000
                );


                return;

            }


            publishButton.disabled =
                true;


            publishButton.textContent =
                "发布中...";


            showPublishMessage(
                "正在处理文章，请稍候...",
                false
            );


            try {

                /* =========================
                   找出文章需要的图片
                ========================== */

                const matches =
                    content.match(
                        /\{\{IMAGE_(\d+)\}\}/g
                    ) || [];


                const requiredImages =
                    [
                        ...new Set(
                            matches.map(
                                function (
                                    placeholder
                                ) {

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
                    "文章需要的图片:",
                    requiredImages
                );


                /* =========================
                   获取图片上传框
                ========================== */

                const imageInputs =
                    getImageInputs();


                const imageUrls = {};


                /* =========================
                   上传图片
                ========================== */

                for (
                    let i = 0;
                    i < imageInputs.length;
                    i++
                ) {

                    const input =
                        imageInputs[i];


                    const item =
                        input.closest(
                            ".image-upload-item"
                        );


                    const number =
                        item?.dataset.imageNumber;


                    if (
                        number &&
                        input.files &&
                        input.files.length > 0
                    ) {

                        showPublishMessage(
                            `正在上传图片 ${number}...`,
                            false
                        );


                        imageUrls[number] =
                            await uploadImage(
                                input.files[0],
                                number
                            );

                    }

                }


                /* =========================
                   检查缺少的图片
                ========================== */

                for (
                    const imageNumber
                    of requiredImages
                ) {

                    if (
                        !imageUrls[imageNumber]
                    ) {

                        throw new Error(
                            `文章使用了 {{IMAGE_${imageNumber}}}，但没有上传对应的图片`
                        );

                    }

                }


                /* =========================
                   替换图片占位符
                ========================== */

                for (
                    const imageNumber
                    of requiredImages
                ) {

                    const placeholder =
                        new RegExp(
                            `\\{\\{IMAGE_${imageNumber}\\}\\}`,
                            "g"
                        );


                    content =
                        content.replace(
                            placeholder,
                            imageUrls[imageNumber]
                        );

                }


                /* =========================
                   第一张图片作为封面
                ========================== */

                const coverImage =
                    imageUrls["1"] || "";


                /* =========================
                   保存文章
                ========================== */

                showPublishMessage(
                    "正在保存文章...",
                    false
                );


                const {
                    error
                } =
                    await supabase
                        .from("articles")
                        .insert(
                            {
                                title:
                                    title,

                                category:
                                    category,

                                cover_image:
                                    coverImage,

                                content:
                                    content
                            }
                        );


                if (error) {

                    console.error(
                        "文章保存失败:",
                        error
                    );


                    throw new Error(
                        `文章保存失败：${error.message}`
                    );

                }


                /* =========================
                   发布成功
                ========================== */

                showPublishMessage(
                    "文章发布成功！",
                    false
                );


                /* =========================
                   清空
                ========================== */

                document
                    .getElementById("title")
                    .value = "";


                document
                    .getElementById("content")
                    .value = "";


                imageUploadList.innerHTML =
                    "";


                publishButton.textContent =
                    "发布成功";


                setTimeout(
                    function () {

                        publishButton.disabled =
                            false;

                        publishButton.textContent =
                            "发布文章";

                    },
                    3000
                );


            } catch (error) {

                console.error(
                    "发布文章失败:",
                    error
                );


                showPublishMessage(
                    error.message ||
                    "发布失败",
                    true
                );


                publishButton.disabled =
                    false;


                publishButton.textContent =
                    "发布文章";

            }

        }
    );

}


/* =========================================================
   发布提示
========================================================= */

function showPublishMessage(
    message,
    isError
) {

    if (!publishMessage) {

        return;

    }


    publishMessage.textContent =
        message;


    if (isError) {

        publishMessage.className =
            "message-error";

    } else {

        publishMessage.className =
            "message-success";

    }

}


/* =========================================================
   退出登录
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            logoutButton.disabled =
                true;


            logoutButton.textContent =
                "退出中...";


            try {

                await supabase.auth.signOut();

            } catch (error) {

                console.error(
                    "退出登录失败:",
                    error
                );

            }


            window.location.href =
                "/admin/index.html";

        }
    );

}
