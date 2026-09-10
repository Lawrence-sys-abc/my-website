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

const articleCategory =
    document.getElementById("articleCategory");

const articleTitle =
    document.getElementById("articleTitle");

const articleDate =
    document.getElementById("articleDate");

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
   日期格式
========================================== */

function formatDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date)
        .toLocaleDateString(
            "zh-CN",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        );
}


/* ==========================================
   自动调整 iframe 高度
========================================== */

function resizeIframe() {

    try {

        const iframeDocument =
            articleFrame.contentDocument ||
            articleFrame.contentWindow.document;


        if (!iframeDocument) {
            return;
        }


        const height =
            Math.max(
                iframeDocument.body
                    ? iframeDocument.body.scrollHeight
                    : 0,

                iframeDocument.documentElement
                    ? iframeDocument.documentElement.scrollHeight
                    : 0
            );


        if (height > 0) {

            articleFrame.style.height =
                height + "px";

        }

    } catch (error) {

        console.warn(
            "无法自动调整文章高度：",
            error
        );

    }

}


/* ==========================================
   获取文章
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

            console.error(
                "Supabase HTTP 状态：",
                response.status
            );


            throw new Error(
                "无法获取文章"
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
           填充标题 / 分类 / 日期
        ====================================== */

        articleCategory.textContent =
            data.category || "";


        articleTitle.textContent =
            data.title || "";


        articleDate.textContent =
            formatDate(
                data.created_at
            );


        /* ======================================
           完整 HTML
           
           content 是一个完整 HTML 页面
           
           不再使用 innerHTML
           
           使用 iframe.srcdoc
        ====================================== */

        if (!data.content) {

            throw new Error(
                "文章 HTML 内容为空"
            );

        }


        articleFrame.onload =
            function() {

                resizeIframe();


                /*
                 * 图片加载完成以后，
                 * 再重新计算一次高度。
                 */

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


                /*
                 * 延迟再计算几次，
                 * 防止字体 / 图片加载导致高度变化。
                 */

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
            data.content;


        /* ======================================
           显示文章
        ====================================== */

        loading.style.display =
            "none";


        article.style.display =
            "block";


        /* ======================================
           修改浏览器标题
        ====================================== */

        document.title =
            `${data.title} - 彭博社 · 创新点子王`;


    } catch (error) {

        console.error(
            "文章加载失败：",
            error
        );

        showError();

    }

}


/* ==========================================
   显示错误
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
