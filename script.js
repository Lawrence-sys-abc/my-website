/* ==========================================
   Supabase 配置
========================================== */

const SUPABASE_URL =
    "你的_SUPABASE_URL";

const SUPABASE_ANON_KEY =
    "你的_SUPABASE_ANON_KEY";


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

        let url =
            `${SUPABASE_URL}/rest/v1/news` +
            `?select=*` +
            `&order=created_at.desc`;


        /* 分类 */

        if (currentCategory !== "全部") {

            url +=
                `&category=eq.${encodeURIComponent(
                    currentCategory
                )}`;

        }


        /* 搜索 */

        if (currentSearch !== "") {

            url +=
                `&title=ilike.*${encodeURIComponent(
                    currentSearch
                )}*`;

        }


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
                "无法获取新闻"
            );

        }


        const news =
            await response.json();


        loading.style.display = "none";


        newsCount.textContent =
            news.length;


        if (news.length === 0) {

            emptyMessage.style.display =
                "block";

            return;

        }


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

        console.error(error);

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


    if (
        index === 0 &&
        currentCategory === "全部" &&
        currentSearch === ""
    ) {

        card.classList.add(
            "featured"
        );

    }


    card.innerHTML = `

        <a
            href="${news.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="news-image-link"
        >

            <img
                src="${news.image_url}"
                alt="${escapeHTML(
                    news.title
                )}"
                class="news-image"
                loading="lazy"
            >

        </a>


        <div class="news-info">

            <span class="news-category">
                ${escapeHTML(
                    news.category
                )}
            </span>


            <a
                href="${news.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="news-title"
            >
                ${escapeHTML(
                    news.title
                )}
            </a>


            <p class="news-description">

                ${escapeHTML(
                    news.description || ""
                )}

            </p>


            <time class="news-date">

                ${formatDate(
                    news.created_at
                )}

            </time>

        </div>

    `;


    newsGrid.appendChild(card);

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
   日期
========================================== */

function formatDate(date) {

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


                pageTitle.textContent =
                    currentCategory === "全部"
                        ? "最新资讯"
                        : `${currentCategory}资讯`;


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
