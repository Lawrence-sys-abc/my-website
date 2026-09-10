/* =====================================================
   新闻数据
===================================================== */

const newsData = [

    /* =========================
       游戏
    ========================== */

    {
        id: 1,

        category: "游戏",

        title: "游戏行业正在迎来新的变化",

        description:
            "从玩家习惯到游戏开发方式，行业正在经历一轮新的变化。",

        image:
            "images/game/game01.jpg",

        date:
            "2026-09-10",

        link:
            "https://example.com/game-news-01",

        featured:
            true
    },

    {
        id: 2,

        category: "游戏",

        title: "新一代游戏作品公布",

        description:
            "开发商公布最新作品，更多游戏内容将在未来陆续公开。",

        image:
            "images/game/game02.jpg",

        date:
            "2026-09-09",

        link:
            "https://example.com/game-news-02",

        featured:
            false
    },

    {
        id: 3,

        category: "游戏",

        title: "玩家正在关注游戏市场的新趋势",

        description:
            "新的消费方式和游戏平台正在改变玩家选择游戏的方式。",

        image:
            "images/game/game03.jpg",

        date:
            "2026-09-08",

        link:
            "https://example.com/game-news-03",

        featured:
            false
    },


    /* =========================
       财经
    ========================== */

    {
        id: 4,

        category: "财经",

        title: "全球市场正在关注新的经济信号",

        description:
            "投资者正在密切关注全球经济环境以及金融市场的最新变化。",

        image:
            "images/finance/finance01.jpg",

        date:
            "2026-09-10",

        link:
            "https://example.com/finance-news-01",

        featured:
            false
    },

    {
        id: 5,

        category: "财经",

        title: "科技公司继续成为资本市场焦点",

        description:
            "科技行业的变化正在影响投资者对未来市场的判断。",

        image:
            "images/finance/finance02.jpg",

        date:
            "2026-09-09",

        link:
            "https://example.com/finance-news-02",

        featured:
            false
    },

    {
        id: 6,

        category: "财经",

        title: "全球企业正在重新评估增长机会",

        description:
            "企业正在寻找新的增长空间，并调整未来的发展策略。",

        image:
            "images/finance/finance03.jpg",

        date:
            "2026-09-07",

        link:
            "https://example.com/finance-news-03",

        featured:
            false
    },


    /* =========================
       娱乐
    ========================== */

    {
        id: 7,

        category: "娱乐",

        title: "影视行业正在进入新的发展阶段",

        description:
            "新的内容形式正在不断出现，影视行业的竞争也更加激烈。",

        image:
            "images/entertainment/entertainment01.jpg",

        date:
            "2026-09-10",

        link:
            "https://example.com/entertainment-news-01",

        featured:
            false
    },

    {
        id: 8,

        category: "娱乐",

        title: "新电影公布最新消息",

        description:
            "新作品公布最新动态，引发观众和影迷关注。",

        image:
            "images/entertainment/entertainment02.jpg",

        date:
            "2026-09-08",

        link:
            "https://example.com/entertainment-news-02",

        featured:
            false
    },

    {
        id: 9,

        category: "娱乐",

        title: "流媒体平台正在改变娱乐产业",

        description:
            "越来越多的观众选择通过数字平台观看新的内容。",

        image:
            "images/entertainment/entertainment03.jpg",

        date:
            "2026-09-06",

        link:
            "https://example.com/entertainment-news-03",

        featured:
            false
    }

];


/* =====================================================
   获取页面元素
===================================================== */

const newsGrid =
    document.getElementById("newsGrid");

const newsCount =
    document.getElementById("newsCount");

const pageTitle =
    document.getElementById("pageTitle");

const emptyMessage =
    document.getElementById("emptyMessage");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryButtons =
    document.querySelectorAll(".category-button");


/* 当前分类 */

let currentCategory = "全部";


/* 当前搜索关键词 */

let currentSearch = "";


/* =====================================================
   显示新闻
===================================================== */

function renderNews() {

    let filteredNews =
        newsData.filter(news => {

            /* 分类筛选 */

            const categoryMatch =
                currentCategory === "全部" ||
                news.category === currentCategory;


            /* 搜索筛选 */

            const searchMatch =
                currentSearch === "" ||
                news.title
                    .toLowerCase()
                    .includes(
                        currentSearch.toLowerCase()
                    ) ||
                news.description
                    .toLowerCase()
                    .includes(
                        currentSearch.toLowerCase()
                    );


            return categoryMatch && searchMatch;

        });


    /* 清空 */

    newsGrid.innerHTML = "";


    /* 更新数量 */

    newsCount.textContent =
        filteredNews.length;


    /* 没有结果 */

    if (filteredNews.length === 0) {

        emptyMessage.style.display = "block";

        return;

    }


    emptyMessage.style.display = "none";


    /* =========================
       创建新闻卡片
    ========================== */

    filteredNews.forEach((news, index) => {

        const card =
            document.createElement("article");


        card.className =
            "news-card";


        /* 第一条新闻为 Featured */

        if (
            index === 0 &&
            currentCategory === "全部" &&
            currentSearch === ""
        ) {

            card.classList.add("featured");

        }


        card.innerHTML = `

            <a
                href="${news.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="news-image-link"
            >

                <img
                    src="${news.image}"
                    alt="${news.title}"
                    class="news-image"
                    loading="lazy"
                >

            </a>


            <div class="news-info">

                <span class="news-category">
                    ${news.category}
                </span>


                <a
                    href="${news.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="news-title"
                >
                    ${news.title}
                </a>


                <p class="news-description">
                    ${news.description}
                </p>


                <time class="news-date">
                    ${news.date}
                </time>

            </div>

        `;


        newsGrid.appendChild(card);

    });

}


/* =====================================================
   分类按钮
===================================================== */

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            /* 当前分类 */

            currentCategory =
                button.dataset.category;


            /* 清空搜索 */

            currentSearch = "";

            searchInput.value = "";


            /* 修改按钮状态 */

            categoryButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            button.classList.add("active");


            /* 修改标题 */

            if (currentCategory === "全部") {

                pageTitle.textContent =
                    "最新资讯";

            } else {

                pageTitle.textContent =
                    currentCategory + "资讯";

            }


            /* 重新显示 */

            renderNews();

        }
    );

});


/* =====================================================
   搜索
===================================================== */

function performSearch() {

    currentSearch =
        searchInput.value.trim();


    pageTitle.textContent =
        currentSearch
            ? `搜索：${currentSearch}`
            : "最新资讯";


    renderNews();

}


/* 点击搜索 */

searchButton.addEventListener(
    "click",
    performSearch
);


/* 回车搜索 */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            performSearch();

        }

    }
);


/* =====================================================
   第一次加载
===================================================== */

renderNews();
