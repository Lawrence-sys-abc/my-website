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

const newsGrid =
    document.getElementById("newsGrid");

const newsCount =
    document.getElementById("newsCount");

const loading =
    document.getElementById("loading");

const emptyMessage =
    document.getElementById("emptyMessage");

const pageTitle =
    document.getElementById("pageTitle");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryButtons =
    document.querySelectorAll(
        ".category-button"
    );


/* ==========================================
   当前状态
========================================== */

let currentCategory = "全部";

let currentSearch = "";


/* ==========================================
   获取新闻
========================================== */

async function getNews() {

    loading.style.display = "block";

    newsGrid.innerHTML = "";

    emptyMessage.style.display = "none";


    try {

        /* ======================================
           从 articles 表获取文章
        ====================================== */

        let url =
            `${SUPABASE_URL}/rest/v1/articles` +
            `?select=id,created_at,title,category,cover_image,content` +
            `&order=created_at.desc`;


        /* ======================================
           分类筛选
        ====================================== */

        if (currentCategory !== "全部") {

            url +=
                `&category=eq.${encodeURIComponent(
                    currentCategory
                )}`;

        }


        /* ======================================
           搜索标题
        ====================================== */

        if (currentSearch !== "") {

            url +=
                `&title=ilike.*${encodeURIComponent(
                    currentSearch
                )}*`;

        }


        /* ======================================
           请求 Supabase
        ====================================== */

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

            const errorText =
                await response.text();

            console.error(
                "Supabase 错误：",
                errorText
            );

            throw new Error(
                "无法获取新闻"
            );

        }


        const news =
            await response.json();


        /* ======================================
           加载完成
        ====================================== */

        loading.style.display = "none";


        newsCount.textContent =
            news.length;


        /* ======================================
           没有新闻
        ====================================== */

        if (news.length === 0) {

            emptyMessage.style.display =
                "block";

            return;

        }


        /* ======================================
           创建新闻卡片
        ====================================== */

        news.forEach(
            (item, index) => {

                createNewsCard(
                    item,
                    index
                );

            }
        );


    } catch (error) {

        loading.style.display = "none";


        newsGrid.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:80px;
            ">

                <h2>
                    新闻加载失败
                </h2>

                <p>
                    请稍后再试
                </p>

            </div>

        `;


        console.error(
            "获取新闻失败：",
            error
        );

    }

}


/* ==========================================
   创建新闻卡片
========================================== */

function createNewsCard(
    news,
    index
) {

    const card =
        document.createElement("article");


    card.className =
        "news-card";


    /* ======================================
       第一篇文章作为 Featured
    ====================================== */

    if (
        index === 0 &&
        currentCategory === "全部" &&
        currentSearch === ""
    ) {

        card.classList.add(
            "featured"
        );

    }


    /* ======================================
       创建图片
    ====================================== */

    let imageHTML = "";


    if (news.cover_image) {

        imageHTML = `

            <div class="news-image-wrapper">

                <img
                    src="${escapeAttribute(
                        news.cover_image
                    )}"
                    alt="${escapeAttribute(
                        news.title
                    )}"
                    class="news-image"
                    loading="lazy"
                >

            </div>

        `;

    } else {

        /* 没有图片时显示占位 */

        imageHTML = `

            <div class="news-image-wrapper no-image">

                <div class="no-image-text">
                    暂无图片
                </div>

            </div>

        `;

    }


    /* ======================================
       新闻卡片 HTML
    ====================================== */

    card.innerHTML = `

        ${imageHTML}


        <div class="news-info">

            <span class="news-category">

                ${escapeHTML(
                    news.category
                )}

            </span>


            <h2 class="news-title">

                ${escapeHTML(
                    news.title
                )}

            </h2>


            <time class="news-date">

                ${formatDate(
                    news.created_at
                )}

            </time>

        </div>

    `;


    /* ======================================
       点击新闻卡片
       
       暂时使用文章 ID
       后面我们可以制作文章详情页
    ====================================== */

card.style.cursor = "pointer";

card.addEventListener(
    "click",
    () => {

        window.location.href =
            `article.html?id=${encodeURIComponent(news.id)}`;

    }
);


/* ==========================================
   防止 HTML 注入
========================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* ==========================================
   防止 HTML 属性注入
========================================== */

function escapeAttribute(text) {

    return String(
        text || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


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
   分类
========================================== */

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentCategory =
                    button.dataset.category;


                /* ==========================
                   更新按钮状态
                ========================== */

                categoryButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                /* ==========================
                   更新页面标题
                ========================== */

                pageTitle.textContent =
                    currentCategory === "全部"
                        ? "最新资讯"
                        : `${currentCategory}资讯`;


                /* ==========================
                   重新获取新闻
                ========================== */

                getNews();

            }
        );

    }
);


/* ==========================================
   搜索
========================================== */

function searchNews() {

    currentSearch =
        searchInput.value.trim();


    getNews();

}


searchButton.addEventListener(
    "click",
    searchNews
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchNews();

        }

    }
);


/* ==========================================
   启动
========================================== */

getNews();
