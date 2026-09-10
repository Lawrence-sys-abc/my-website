/* ==========================================
   Supabase 配置
========================================== */

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";


/* ==========================================
   页面元素
========================================== */

const loading =
    document.getElementById("loading");

const article =
    document.getElementById("article");

const errorMessage =
    document.getElementById("errorMessage");

const articleFrame =
    document.getElementById("articleFrame");


/* ==========================================
   获取文章 ID
========================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const articleId =
    params.get("id");


/* ==========================================
   自动调整 iframe 高度
========================================== */

function resizeIframe() {

    try {

        const doc =
            articleFrame.contentDocument ||
            articleFrame.contentWindow.document;

        if (!doc) {
            return;
        }

        const bodyHeight =
            doc.body
                ? doc.body.scrollHeight
                : 0;

        const documentHeight =
            doc.documentElement
                ? doc.documentElement.scrollHeight
                : 0;

        const height =
            Math.max(
                bodyHeight,
                documentHeight,
                900
            );

        articleFrame.style.height =
            height + "px";

    } catch (error) {

        console.warn(
            "iframe 高度调整失败：",
            error
        );

    }

}


/* ==========================================
   加载文章
========================================== */

async function getArticle() {

    if (!articleId) {

        showError();

        return;
    }


    try {

        const url =
            `${SUPABASE_URL}/rest/v1/articles` +
            `?select=id,created_at,title,category,content` +
            `&id=eq.${encodeURIComponent(articleId)}`;


        const response =
            await fetch(
                url,
                {
                    headers: {

                        apikey:
                            SUPABASE_ANON_KEY,

                        Authorization:
                            `Bearer ${SUPABASE_ANON_KEY}`

                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const articles =
            await response.json();


        if (
            !articles ||
            articles.length === 0
        ) {

            showError();

            return;
        }


        const data =
            articles[0];


        /* ======================================
           检查 HTML
        ====================================== */

        let content =
            data.content || "";


        if (!content.trim()) {

            throw new Error(
                "文章 HTML 为空"
            );

        }


        /*
         * 如果数据库里错误地保存了
         * Python 代码 + HTML，
         * 自动从 <!DOCTYPE html> 开始截取。
         *
         * 这样可以兼容已经发布的错误内容。
         */

        const doctypeIndex =
            content
                .toLowerCase()
                .indexOf("<!doctype html>");


        if (doctypeIndex > 0) {

            content =
                content.substring(
                    doctypeIndex
                );

        }


        /* ======================================
           设置 iframe
        ====================================== */

        articleFrame.onload =
            function() {

                resizeIframe();


                /*
                 * 图片加载完成后重新计算高度
                 */

                try {

                    const images =
                        articleFrame
                            .contentDocument
                            .images;


                    for (
                        const image of images
                    ) {

                        image.addEventListener(
                            "load",
                            resizeIframe
                        );

                    }

                } catch (error) {

                    console.warn(
                        "图片监听失败：",
                        error
                    );

                }


                setTimeout(
                    resizeIframe,
                    100
                );

                setTimeout(
                    resizeIframe,
                    500
                );

                setTimeout(
                    resizeIframe,
                    1000
                );

            };


        articleFrame.srcdoc =
            content;


        /* ======================================
           显示
        ====================================== */

        loading.style.display =
            "none";

        article.style.display =
            "block";


        document.title =
            `${data.title || "文章"} - 彭博社 · 创新点子王`;


    } catch (error) {

        console.error(
            "文章加载失败：",
            error
        );

        showError();

    }

}


/* ==========================================
   错误
========================================== */

function showError() {

    loading.style.display =
        "none";

    article.style.display =
        "none";

    errorMessage.style.display =
        "block";

}


/* ==========================================
   启动
========================================== */

getArticle();
