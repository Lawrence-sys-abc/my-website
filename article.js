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

const articleCover =
    document.getElementById("articleCover");

const articleContent =
    document.getElementById("articleContent");


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
            `?select=id,created_at,title,category,cover_image,content` +
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
           填充文章内容
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
           封面图片
        ====================================== */

        if (data.cover_image) {

            articleCover.src =
                data.cover_image;

            articleCover.alt =
                data.title || "";

            articleCover.style.display =
                "block";

        }


        /* ======================================
           正文 HTML
           
           content 本身就是你后台输入的 HTML
        ====================================== */

        articleContent.innerHTML =
            data.content || "";


        /* ======================================
           显示文章
        ====================================== */

        loading.style.display =
            "none";

        article.style.display =
            "block";


        /* 修改浏览器标题 */

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
