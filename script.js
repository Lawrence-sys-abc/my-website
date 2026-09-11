/* ==========================================
   Supabase 配置
========================================== */

const SUPABASE_URL =
    "https://lyfdqypsivxthrydwktx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkdrJ0FOLBNQ2jDqVuzfHw_zAeJlhEb";


/* ==========================================
   分页设置
========================================== */

const PAGE_SIZE = 12;


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

const pagination =
    document.getElementById("pagination");

const categoryButtons =
    document.querySelectorAll(
        ".category-button"
    );


/* ==========================================
   当前状态
========================================== */

let currentCategory = "全部";

let currentSearch = "";

let currentPage = 1;

let totalNewsCount = 0;

let totalPages = 0;


/* ==========================================
   获取新闻
========================================== */

async function getNews() {

    loading.style.display = "block";

    newsGrid.innerHTML = "";

    emptyMessage.style.display = "none";

    pagination.innerHTML = "";


    try {

        /* ======================================
           计算当前页需要的数据范围
        ====================================== */

        const from =
            (currentPage - 1) * PAGE_SIZE;

        const to =
            from + PAGE_SIZE - 1;


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
           真正的 Supabase 数据库分页
           
           Range:
           0-11   = 第1页
           12-23  = 第2页
           24-35  = 第3页
           ...
        ====================================== */

        const response =
            await fetch(
                url,
                {

                    headers: {

                        apikey:
                            SUPABASE_ANON_KEY,

                        Authorization:
                            `Bearer ${SUPABASE_ANON_KEY}`,

                        Range:
                            `${from}-${to}`,

                        Prefer:
                            "count=exact"

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


        /* ======================================
           获取当前页新闻
        ====================================== */

        const news =
            await response.json();


        /* ======================================
           获取符合当前筛选条件的新闻总数
        ====================================== */

        const contentRange =
            response.headers.get(
                "Content-Range"
            );


        if (contentRange) {

            /*
               Content-Range 可能类似：

               0-11/37

               这里的 37 就是总新闻数量。
            */

            const totalPart =
                contentRange.split("/")[1];


            if (
                totalPart &&
                totalPart !== "*"
            ) {

                totalNewsCount =
                    parseInt(
                        totalPart,
                        10
                    );

            }

        }


        /* ======================================
           计算总页数
        ====================================== */

        totalPages =
            Math.ceil(
                totalNewsCount / PAGE_SIZE
            );


        /* ======================================
           如果当前页超出了实际页数
           
           例如删除新闻以后：
           原来在第4页
           结果现在只有3页
           
           自动回到最后一页
        ====================================== */

        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {

            currentPage =
                totalPages;

            return getNews();

        }


        /* ======================================
           加载完成
        ====================================== */

        loading.style.display = "none";


        newsCount.textContent =
            totalNewsCount;


        /* ======================================
           没有新闻
        ====================================== */

        if (
            news.length === 0 ||
            totalNewsCount === 0
        ) {

            emptyMessage.style.display =
                "block";

            pagination.innerHTML = "";

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


        /* ======================================
           创建分页
        ====================================== */

        createPagination();


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


        pagination.innerHTML = "";


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
       
       保持你原来的逻辑：
       只有「全部」且没有搜索时，
       当前页面的第一篇文章作为 Featured。
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

        imageHTML = `

            <div class="news-image-wrapper no-image">

                <div class="no-image-text">
                    暂无图片
                </div>

            </div>

        `;

    }


    /* ======================================
       新闻卡片
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
       点击文章
    ====================================== */

    card.style.cursor = "pointer";


    card.addEventListener(
        "click",
        () => {

            window.location.href =
                `article.html?id=${encodeURIComponent(
                    news.id
                )}`;

        }
    );


    /* ======================================
       添加到新闻列表
    ====================================== */

    newsGrid.appendChild(
        card
    );

}


/* ==========================================
   创建分页
========================================== */

function createPagination() {

    pagination.innerHTML = "";


    /* ======================================
       没有分页时不显示
       
       例如：
       新闻只有 12 篇
       只需要一页
    ====================================== */

    if (totalPages <= 1) {

        return;

    }


    /* ======================================
       上一页
    ====================================== */

    const previousButton =
        document.createElement("button");


    previousButton.type =
        "button";


    previousButton.className =
        "pagination-button pagination-prev";


    previousButton.textContent =
        "上一页";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        () => {

            if (
                currentPage <= 1
            ) {

                return;

            }


            currentPage--;

            getNews();


            scrollToNewsTop();

        }
    );


    pagination.appendChild(
        previousButton
    );


    /* ======================================
       页码
    ====================================== */

    const pageNumbers =
        document.createElement("div");


    pageNumbers.className =
        "pagination-numbers";


    /*
       为了避免新闻很多时分页按钮
       无限变长，只显示有限页码。

       例如当前第 5 页：

       1 2 3 4 5 6 7 ... 20
    */

    const pages =
        getPaginationPages();


    pages.forEach(
        page => {

            if (page === "...") {

                const ellipsis =
                    document.createElement("span");


                ellipsis.className =
                    "pagination-ellipsis";


                ellipsis.textContent =
                    "...";


                pageNumbers.appendChild(
                    ellipsis
                );


                return;

            }


            const pageButton =
                document.createElement("button");


            pageButton.type =
                "button";


            pageButton.className =
                "pagination-button";


            pageButton.textContent =
                page;


            if (
                page === currentPage
            ) {

                pageButton.classList.add(
                    "active"
                );

                pageButton.setAttribute(
                    "aria-current",
                    "page"
                );

            }


            pageButton.addEventListener(
                "click",
                () => {

                    if (
                        page === currentPage
                    ) {

                        return;

                    }


                    currentPage =
                        page;


                    getNews();


                    scrollToNewsTop();

                }
            );


            pageNumbers.appendChild(
                pageButton
            );

        }
    );


    pagination.appendChild(
        pageNumbers
    );


    /* ======================================
       下一页
    ====================================== */

    const nextButton =
        document.createElement("button");


    nextButton.type =
        "button";


    nextButton.className =
        "pagination-button pagination-next";


    nextButton.textContent =
        "下一页";


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentPage >= totalPages
            ) {

                return;

            }


            currentPage++;

            getNews();


            scrollToNewsTop();

        }
    );


    pagination.appendChild(
        nextButton
    );

}


/* ==========================================
   获取分页页码
========================================== */

function getPaginationPages() {

    const pages = [];


    /*
       页面很少时：

       1 2 3 4 5
    */

    if (totalPages <= 7) {

        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pages.push(i);

        }

        return pages;

    }


    /*
       当前页靠前：

       1 2 3 4 5 ... 20
    */

    if (currentPage <= 4) {

        pages.push(
            1,
            2,
            3,
            4,
            5,
            "...",
            totalPages
        );

        return pages;

    }


    /*
       当前页靠后：

       1 ... 16 17 18 19 20
    */

    if (
        currentPage >=
        totalPages - 3
    ) {

        pages.push(
            1,
            "...",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages
        );

        return pages;

    }


    /*
       当前页在中间：

       1 ... 7 8 9 ... 20
    */

    pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
    );


    return pages;

}


/* ==========================================
   滚动到新闻区域
========================================== */

function scrollToNewsTop() {

    const heading =
        document.querySelector(
            ".page-heading"
        );


    if (!heading) {

        return;

    }


    const headerOffset = 130;


    const top =
        heading.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;


    window.scrollTo(
        {
            top: Math.max(
                0,
                top
            ),
            behavior: "smooth"
        }
    );

}


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


                /*
                   切换分类以后
                   必须回到第一页
                */

                currentPage = 1;


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


    /*
       搜索条件发生变化以后
       回到第一页
    */

    currentPage = 1;


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
