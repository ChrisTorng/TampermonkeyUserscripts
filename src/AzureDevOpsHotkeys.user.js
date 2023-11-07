// ==UserScript==
// @name         Azure DevOps: 優化快速鍵操作
// @version      0.5
// @description  讓 Azure DevOps Services 的快速鍵操作貼近 Visual Studio Code 與 Vim 操作
// @license      MIT
// @homepage     https://blog.miniasp.com/
// @homepageURL  https://blog.miniasp.com/
// @website      https://www.facebook.com/will.fans
// @source       https://github.com/doggy8088/TampermonkeyUserscripts/raw/main/src/AzureDevOpsHotkeys.user.js
// @namespace    https://github.com/doggy8088/TampermonkeyUserscripts/raw/main/src/AzureDevOpsHotkeys.user.js
// @match        *://*.visualstudio.com/*
// @match        *://dev.azure.com/*
// @author       Will Huang
// @run-at       document-idle
// ==/UserScript==

// https://www.tampermonkey.net/documentation.php#_run_at

(function () {
    'use strict';

    // DEBUG
    var console = {
        log: function () {
            // window.console.log.apply(console, arguments);
        }
    };

    (function () {
        'use strict';

        var [orgBaseUrl, orgName, urlType] = getOrgInfo();
        console.log(`Organization Info: orgBaseUrl = ${orgBaseUrl}, orgName = ${orgName}, urlType = ${urlType}`);

        if (!orgBaseUrl) {
            throw new Error('無法取得 Azure DevOps 網址');
        }

        var [projectUrl, projectName,] = getProjectInfo();
        console.log(`Project Info: projectUrl = ${projectUrl}, projectName = ${projectName}`);

        let keySequence = '';

        document.addEventListener('keydown', function (event) {

            // 按下 Ctrl+B 可以切換側邊欄 (只有 Wiki 頁面才有這個按鈕)
            if (event.ctrlKey && event.key === 'b') {
                console.log('按下 Ctrl+B 可以切換側邊欄');
                toggleSidePane();
            }

            var isTyping = false;

            // 檢查焦點是否在文字輸入框中
            if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
                isTyping = true;
                resetKeySequence();
            } else {
                isTyping = false;
            }

            //  有任何一個修飾鍵被按下時，就不要處理事件
            if (!isTyping && (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey)) {

                // 替首頁的 Tab List 加上 accesskey，讓我們可以透過 Alt+1 ~ Alt+9 快速切換 Tab
                var tabList = document.querySelector('div[role="tablist"]');
                if (tabList) {
                    tabList.querySelectorAll('[role="tab"]').forEach((tab) => {
                        if (!tab.getAttribute('accesskey') && !!tab.getAttribute('aria-posinset')) {
                            tab.setAttribute('accesskey', tab.getAttribute('aria-posinset'));
                        }
                    });
                }

                return;
            }

            // 在 Azure DevOps Services 首頁的時候沒有 Project Name 在網址列上
            if (isInHome()) {
                if (isTyping) {
                    if (event.key === 'Escape') {
                        document.activeElement.blur();
                    }
                } else {
                    switch (event.key) {
                        case 'f':
                            document.querySelector('input[role="searchbox"]')?.focus();
                            event.preventDefault();
                            break;

                        case '1':
                        case '2':
                        case '3':
                        case '4':
                            var idx = parseInt(event.key) - 1;
                            var projectCards = document.querySelectorAll('.project-card');
                            if (projectCards[idx]) {
                                projectCards[idx].querySelector('a').click();
                            }
                            event.preventDefault();
                            break;

                        case 'Escape':
                            var projectList = document.querySelector('.project-list');
                            var projectRows = projectList.querySelectorAll('tr.project-row');
                            if (projectRows) {
                                var projectRowsArray = [...projectRows];
                                console.log(`目前共有 ${projectRowsArray.length} 個專案`);
                                var focusedIndex = projectRowsArray.findIndex((row) => row.classList.contains('focused'));
                                console.log(`目前焦點在第 ${focusedIndex} 個專案`)
                                if (projectRowsArray[focusedIndex]) {
                                    projectRowsArray[focusedIndex].querySelectorAll('a').forEach((link) => {
                                        link.blur();
                                        link.classList.remove('cursor-selected');
                                    });
                                    projectRowsArray[focusedIndex].blur();
                                    projectRowsArray[focusedIndex].classList.remove('focused');
                                }
                            }
                            console.log('按下 ESC 鍵，回到頁首並移除焦點')
                            var mainContent = document.getElementById('skip-to-main-content');
                            console.log('mainContent', mainContent)
                            var scrollbar = mainContent.querySelector('.custom-scrollbar');
                            console.log('scrollbar', scrollbar)
                            if (scrollbar) {
                                scrollbar.scrollTo(0, 0);
                            }
                            break;

                        case 'Enter':
                            var projectList = document.querySelector('.project-list');
                            var projectRows = projectList.querySelectorAll('tr.project-row');
                            if (projectRows) {
                                var projectRowsArray = [...projectRows];
                                console.log(`目前共有 ${projectRowsArray.length} 個專案`);
                                var focusedIndex = projectRowsArray.findIndex((row) => row.classList.contains('focused'));
                                console.log(`目前焦點在第 ${focusedIndex} 個專案`)
                                if (projectRowsArray[focusedIndex]) {
                                    projectRowsArray[focusedIndex].querySelector('a').click();
                                }
                            }
                            break;

                        case 'j':
                            var projectList = document.querySelector('.project-list');
                            if (projectList) {
                                var projectRows = projectList.querySelectorAll('tr.project-row');
                                if (projectRows) {
                                    var projectRowsArray = [...projectRows];
                                    console.log(`目前共有 ${projectRowsArray.length} 個專案`);
                                    var focusedIndex = projectRowsArray.findIndex((row) => row.classList.contains('focused'));
                                    console.log(`目前焦點在第 ${focusedIndex} 個專案`)
                                    if (focusedIndex === -1) {
                                        focusedIndex = 0;
                                    } else {
                                        projectRowsArray[focusedIndex].classList.remove('focused');
                                        focusedIndex++;
                                    }
                                    console.log(`移動焦點到第 ${focusedIndex} 個專案`)
                                    projectRowsArray[focusedIndex].focus();
                                    projectRowsArray[focusedIndex].classList.add('focused');
                                    projectRowsArray[focusedIndex].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

                                    event.preventDefault();
                                }
                            }
                            break;

                        case 'k':
                            var projectList = document.querySelector('.project-list');
                            if (projectList) {
                                var projectRows = projectList.querySelectorAll('tr.project-row');
                                if (projectRows) {
                                    var projectRowsArray = [...projectRows];
                                    console.log(`目前共有 ${projectRowsArray.length} 個專案`);
                                    var focusedIndex = projectRowsArray.findIndex((row) => row.classList.contains('focused'));
                                    console.log(`目前焦點在第 ${focusedIndex} 個專案`)
                                    if (focusedIndex === -1) {
                                        focusedIndex = 0;
                                    } else if (focusedIndex === 0) {
                                        projectRowsArray[focusedIndex].classList.remove('focused');
                                        focusedIndex = projectRowsArray.length - 1;
                                    } else {
                                        projectRowsArray[focusedIndex].classList.remove('focused');
                                        focusedIndex--;
                                    }
                                    console.log(`移動焦點到第 ${focusedIndex} 個專案`)
                                    projectRowsArray[focusedIndex].focus();
                                    projectRowsArray[focusedIndex].classList.add('focused');
                                    projectRowsArray[focusedIndex].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

                                    event.preventDefault();
                                }
                            }
                            break;

                        case 'l':
                            var projectList = document.querySelector('.project-list');
                            if (projectList) {
                                var projectRows = projectList.querySelectorAll('tr.project-row');
                                if (projectRows) {
                                    var projectRowsArray = [...projectRows];
                                    var focusedElement = projectRowsArray.find((row) => row.classList.contains('focused'));
                                    if (focusedElement) {
                                        var links = Array.from(focusedElement.querySelectorAll('a'));

                                        var idx = links.findIndex((link) => { return link.classList.contains('cursor-selected'); });
                                        if (idx === -1) {
                                            idx = 0;
                                        } else {
                                            links[idx].classList.remove('cursor-selected');
                                            idx++;
                                            if (idx >= links.length) {
                                                idx = 0;
                                            }
                                        }
                                        if (links[idx]) {
                                            links[idx].focus();
                                            links[idx].classList.add('cursor-selected');
                                        }
                                    }
                                }
                            }

                            break;

                        case 'h':
                            var projectList = document.querySelector('.project-list');
                            if (projectList) {
                                var projectRows = projectList.querySelectorAll('tr.project-row');
                                if (projectRows) {
                                    var projectRowsArray = [...projectRows];
                                    var focusedElement = projectRowsArray.find((row) => row.classList.contains('focused'));
                                    if (focusedElement) {
                                        var links = Array.from(focusedElement.querySelectorAll('a'));

                                        var idx = links.findIndex((link) => { return link.classList.contains('cursor-selected'); });
                                        if (idx === -1) {
                                            idx = 0;
                                        } else if (idx === 0) {
                                            links[idx].classList.remove('cursor-selected');
                                            idx = links.length - 1;

                                        } else {
                                            links[idx].classList.remove('cursor-selected');
                                            idx--;
                                        }
                                        if (links[idx]) {
                                            links[idx].focus();
                                            links[idx].classList.add('cursor-selected');
                                        }
                                    }
                                }
                            }

                            break;

                        default:
                            break;
                    }
                }
            }

            // 在 Azure DevOps Services 的專案內
            if (isInProject()) {

                var [projectBaseUrl, projectName, isInRepos] = getProjectInfo();

                if (isTyping) {
                    if (event.key === 'Escape' && event.target.tagName === 'INPUT') {
                        event.target.blur();
                    }
                    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
                        event.target.blur();
                    }
                    return;
                }

                keySequence += event.key;
                console.log(`keySequence: \"${keySequence}\"`);

                // 記錄一下內建的命令

                // 按下 gc 會進入 Repos > Files 頁面
                // 按下 gch 會進入 Repos > Commits (History) 頁面
                // 按下 gcb 會進入 Repos > Branches 頁面
                // 按下 gcq 會進入 Repos > Pull requests 頁面
                // 按下 r 可以選擇 Repository

                // 連續按下 gw 就會進入 Overview > Wiki 頁面
                if (keySequence.endsWith("gw")) {
                    console.log("連續按下 g 和 w 觸發事件");
                    window.location.href = `${projectBaseUrl}/_wiki`;
                    return;
                }

                // 連續按下 gd 就會進入 Overview > Dashboards 頁面
                if (keySequence.endsWith("gd")) {
                    console.log("連續按下 g 和 d 觸發事件");
                    window.location.href = `${projectBaseUrl}/_dashboards`;
                    return;
                }

                // 連續按下 gl 就會進入 Board > Backlogs 頁面
                if (keySequence.endsWith("gl")) {
                    console.log("連續按下 g 和 l 觸發事件");
                    window.location.href = `${projectBaseUrl}/_backlogs/backlog`;
                    return;
                }

                // 連續按下 gs 就會進入 Board > Sprints 頁面
                if (keySequence.endsWith("gs")) {
                    console.log("連續按下 g 和 s 觸發事件");
                    window.location.href = `${projectBaseUrl}/_sprints`;
                    return;
                }

                // 連續按下 gb 就會進入 Pipelines > Builds 頁面 (內建)
                // if (keySequence.endsWith("gb")) {
                //     console.log("連續按下 g 和 b 觸發事件");
                //     window.location.href = `${projectBaseUrl}/_build`;
                //     return;
                // }

                // 連續按下 gr 就會進入 Pipelines > Releases 頁面
                if (keySequence.endsWith("gr")) {
                    console.log("連續按下 g 和 r 觸發事件");
                    window.location.href = `${projectBaseUrl}/_release`;
                    return;
                }

                if (isInProjectWikis()) {

                    // 若使用者按下 j 鍵，就將文件選取的光棒往下移動一行
                    if (keySequence.endsWith('j')) {
                        moveWikiItemsCursor('down');
                        focusWikiViewContainer();
                        resetKeySequence();
                    }

                    // 若使用者按下 k 鍵，就將文件選取的光棒往下移動一行
                    if (keySequence.endsWith('k')) {
                        moveWikiItemsCursor('up');
                        focusWikiViewContainer();
                        resetKeySequence();
                    }

                    // 若使用者按下 Enter 鍵，就執行光棒的 click 事件
                    if (keySequence.endsWith('Enter')) {
                        get_current_leftpane_cursor().click();
                        focusWikiViewContainer();
                        resetKeySequence();
                    }

                    // 若使用者按下 f 鍵，就將游標移至 Filter pages by title 欄位
                    if (keySequence.endsWith('f')) {
                        const splitterPane = get_splitter_pane();
                        splitterPane.querySelector('input[role="searchbox"]')?.focus();
                        event.preventDefault();
                        resetKeySequence();
                    }

                }
            }

            function toggleSidePane() {
                const splitterPane = get_splitter_pane();
                const navigationPane = get_navigation_pane();

                if (splitterPane) {
                    const showLessInformationBtn = splitterPane.querySelector('[aria-label="Show less information"][role="button"]');
                    const showMoreInformationBtn = splitterPane.querySelector('[aria-label="Show more information"][role="button"]');
                    const theButton = showLessInformationBtn || showMoreInformationBtn;
                    if (theButton) {
                        console.log('切換 splitterPane 的按鈕已找到', theButton);
                        theButton.click();
                        return;
                    }
                }

                if (navigationPane) {
                    const showLessInformationBtn = navigationPane.querySelector('[aria-label="Show less information"][role="button"]');
                    const showMoreInformationBtn = navigationPane.querySelector('[aria-label="Show more information"][role="button"]');
                    const theButton = showLessInformationBtn || showMoreInformationBtn;
                    if (theButton) {
                        console.log('切換 navigationPane 的按鈕已找到', theButton);
                        theButton.click();
                        return
                    }
                }
            }
        });

        function resetKeySequence() {
            keySequence = '';
        }

        focusWikiViewContainer();

    })();

    function getOrgInfo() {

        // Organization names
        // https://learn.microsoft.com/en-us/azure/devops/organizations/settings/naming-restrictions?view=azure-devops&WT.mc_id=DT-MVP-4015686#organization-names

        /*
            Currently, you can only use letters from the English alphabet in your organization name.
            Start organization names with a letter or number, followed by letters, numbers, or hyphens.
            Organization names must not contain more than 50 Unicode characters and must end with a letter or number.
        */

        let urlBase;
        let orgName;
        let urlType;

        // https://ORG-NAME.azure.com/PROJECT-NAME/*
        const orgNameRegex = '[a-z0-9][a-z0-9-]{1,49}';
        const regex1 = new RegExp(`^https://(${orgNameRegex})\\.visualstudio\\.com(/DefaultCollection)?`, 'i');
        const regex2 = new RegExp(`^https://dev\\.azure\\.com/(${orgNameRegex})`, 'i');

        const match1 = window.location.href.match(regex1);
        const match2 = window.location.href.match(regex2);

        // /^https:\/\/([\w-]+)\.visualstudio\.com/;
        if (match1) {
            urlBase = match1[0];
            orgName = match1[1];
            urlType = 1; // 第一代的網址格式
        }

        // https://dev.azure.com/ORG-NAME/PROJECT-NAME/*
        if (match2) {
            urlBase = match2[0];
            orgName = match2[1];
            urlType = 2; // 第二代的網址格式
        }

        return [urlBase, orgName, urlType];
    }

    /**
     * 檢查目前是否在專案內
     */
    function isInProject() {
        var [, prjName] = getProjectInfo();
        return prjName !== undefined;
    }

    function isInHome() {
        var [, prjName] = getProjectInfo();
        return prjName === undefined;
    }

    function getProjectReposInfo() {
        var [, , isInRepos] = getProjectInfo();
        return isInRepos;
    }

    function isInProjectWikis() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_wiki`, 'i');
        var isInWiki = !!window.location.href.match(regex);
        console.log(`isInProjectWikis: ${isInWiki}, baseUrlRegex = ${baseUrlRegex}`);
        return isInWiki;
    }

    function isInProjectBoardsWorkItems() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_workitems`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsBoards() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_boards`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsBacklogs() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_backlogs`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsSprints() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_sprints`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsQueries() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_queries`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsDeliveryPlans() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_deliveryplans`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectBoardsAnalyticsViews() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_analytics`, 'i');
        return !!window.location.href.match(regex);
    }

    /** 取得當前網址 (不含 Query String 與 Hash 內容) */
    function getCurrentURL() {
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = '';
        return url.toString();
    }

    function getProjectReposInfo() {
        var [projectBaseUrl, , isInRepos] = getProjectInfo();
        if (!isInRepos) return false;

        var baseUrlRegex = escapeRegExp(projectBaseUrl);

        var baseUrl;
        var repoName;

        // Repo names
        // https://learn.microsoft.com/en-us/azure/devops/organizations/settings/naming-restrictions?view=azure-devops&WT.mc_id=DT-MVP-4015686#azure-repos-git

        /*
            Length: Must not contain more than 64 Unicode characters.
            Uniqueness: Must not be identical to any other Git repo name in the project.
            Special characters:
            - Must not contain any Unicode control characters or surrogate characters.
            - Must not contain the following printable characters: \ / : * ? " < > | ; # $ * { } , + = [ ].
            - Must not start with an underscore _.
            - Must not start or end with a period ..
            - Must not be a system reserved name.
        */

        let repoNameRegex = '(?!_)(?!.*([.]{2}|[\\\\/:*?"<>|;#$*{},+=\\[\\]])|^[\\x00-\\x1F\\x7F])(?![.])[^\\x00-\\x1F\\x7F]{1,64})';

        const regex = new RegExp(`^${baseUrlRegex}/(${repoNameRegex})`, 'i');
        var match = getCurrentURL().match(regex);
        if (match) {
            baseUrl = match[0];
            repoName = match[1];
        }

        return [baseUrl, repoName];
    }

    function isInProjectReposFiles() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposCommits() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/commit(s)?`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposPushes() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/pushes$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposBranches() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/branches$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposTags() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/tags$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposPullRequests() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/pullrequests$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposPullRequestsCreate() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/pullrequestcreate$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectReposAdvancedSecurity() {
        var [repoBaseUrl, repoName] = getProjectReposInfo();

        var baseUrlRegex = escapeRegExp(repoBaseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/alerts$`, 'i');
        var match = getCurrentURL().match(regex);
        return !!match;
    }

    function isInProjectPipelinesBuilds() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_build$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesEnvironments() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_environments$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesReleases() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_release$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesLibrary() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_library$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesTaskGroups() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_taskgroups$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesDeploymentGroups() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_machinegroup$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesXAML() {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/xaml$`, 'i');
        return !!window.location.href.match(regex);
    }

    function isInProjectPipelinesArtifacts
        () {
        var [baseUrl] = getProjectInfo();
        var baseUrlRegex = escapeRegExp(baseUrl);
        const regex = new RegExp(`^${baseUrlRegex}/_artifacts`, 'i');
        return !!window.location.href.match(regex);
    }

    function getProjectInfo() {

        let urlBase;
        let prjName;
        let isRepos;

        var [orgBaseUrl, , urlType] = getOrgInfo();
        var orgBaseUrlRegex = escapeRegExp(orgBaseUrl);

        /*
            Project names
            https://learn.microsoft.com/en-us/azure/devops/organizations/settings/naming-restrictions?view=azure-devops&WT.mc_id=DT-MVP-4015686#project-names

            Length: Must not contain more than 64 Unicode characters.

            Uniqueness: Must not be identical to any other name in the project collection, the SharePoint Web application that supports the collection, or the instance of SQL Server Reporting Services that supports the collection.

            Reserves names:
            - Must not be a system reserved name.
            - Must not be one of the hidden segments used for IIS request filtering like App_Browsers, App_code, App_Data, App_GlobalResources, App_LocalResources, App_Themes, App_WebResources, bin, or web.config.

            Special characters
            - Must not contain any Unicode control characters or surrogate characters.
            - Must not contain the following printable characters: \ / : * ? " < > | ; # $ * { } , + = [ ].
            - Must not start with an underscore _.
            - Must not start or end with a period ..
         */

        const projectNameRegex = '(?!.*[\\:\\*\\?"<>|;#$*\\{\\},+=\\[\\]])[^._][^/]{1,63}'
        let regexUrl;
        let match;
        switch (urlType) {
            case 1:
                // https://miniasp.visualstudio.com
                regexUrl = new RegExp(`^${orgBaseUrlRegex}/(${projectNameRegex})(/_git)?`, 'i');
                match = window.location.href.match(regexUrl);
                if (match) {
                    urlBase = match[0];
                    prjName = match[1];
                    isRepos = match[2] === '/_git';
                    break;
                }
                // 後來好像改成這種網址
                regexUrl = new RegExp(`^${orgBaseUrlRegex}/(_git/)?(${projectNameRegex})`, 'i');
                match = window.location.href.match(regexUrl);
                if (match) {
                    urlBase = match[0];
                    isRepos = match[1] === '_git/';
                    prjName = match[2];
                }

                break;
            case 2:
                // https://dev.azure.com/miniasp
                regexUrl = new RegExp(`^${orgBaseUrlRegex}/(_git/)?(${projectNameRegex})`, 'i');
                match = window.location.href.match(regexUrl);
                if (match) {
                    urlBase = match[0];
                    isRepos = match[1] === '_git/';
                    prjName = match[2];
                }
                break;
            default:
                throw new Error('無法取得專案名稱');
                break;
        }

        if (isRepos) {
            urlBase = urlBase.replace('/_git', '');
        }

        return [urlBase, prjName, isRepos];
    }

    // https://stackoverflow.com/a/23637821/910074
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    function get_navigation_pane() {
        return document.querySelector('[data-renderedregion="navigation"]');
    }

    function get_splitter_pane() {
        return document.querySelector('.vss-Splitter--pane-fixed');
    }

    function get_current_leftpane_cursor() {
        return get_splitter_pane().querySelector('tr[aria-selected="true"]');
    }

    function focusWikiViewContainer() {
        setTimeout(() => {
            let wikiViewContainer = document.querySelector('.wiki-view-container');
            if (wikiViewContainer) {
                // There are many scrollable area in a web page. When I use the mouse to click on a scrollable DIV on a web page, I can hit Space key to scroll down on that part of a HTML page. When focus lost, I can't hit Space key to scroll on that area. What if I want to get focus again to that area so that I can let user hit Space key to scroll. What can I do using JS?
                wikiViewContainer.setAttribute('tabindex', '-1');
                wikiViewContainer.focus();
            }
        }, 100);
    }

    function moveWikiItemsCursor(direction = 'down') {
        const splitterPane = get_splitter_pane();
        const allItems = splitterPane.querySelectorAll(`tr[data-row-index]`);
        // get last index
        const lastIndex = parseInt(allItems[allItems.length - 1].getAttribute('data-row-index'));

        const currentItem = splitterPane.querySelector('tr[aria-selected="true"]');
        console.log("currentItem", currentItem)

        if (!currentItem) {
            const nextItem = splitterPane.querySelector(`tr[data-row-index="0"]`);
            nextItem.setAttribute('aria-selected', 'true');
            nextItem.classList.add('selected');
        } else {
            const currentIndex = currentItem.getAttribute('data-row-index');
            console.log("currentIndex", currentIndex)
            let nextIndex = parseInt(currentIndex);

            if (direction == 'down') {
                nextIndex = nextIndex + 1;
            } else {
                nextIndex = nextIndex - 1;
            }
            console.log("nextIndex", nextIndex)

            if (!splitterPane.querySelector(`tr[data-row-index="${nextIndex}"]`)) {
                if (direction == 'down') {
                    nextIndex = 0;
                } else {
                    nextIndex = lastIndex;
                }
            }
            console.log("nextIndex", nextIndex)

            const nextItem = splitterPane.querySelector(`tr[data-row-index="${nextIndex}"]`);
            console.log("nextItem", nextItem);

            currentItem.removeAttribute('aria-selected');
            currentItem.classList.remove('selected');

            nextItem.setAttribute('aria-selected', 'true');
            nextItem.classList.add('selected');

            nextItem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
    }

})();