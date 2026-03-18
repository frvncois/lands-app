<template>
    <section>
        <div class="create">
            <div class="title">
                <h3>Create and customize your Linktree in minutes</h3>
                <p>Join 70M+ people using Linktree for their link in bio. One link to help  you share everything you create, curate and sell from your Instagram,  TikTok, Twitter, YouTube and other social media profiles.</p>
            </div>
            <div>
                <img src="@/assets/phone.png"/>
                <ul>
                    <li>Design & Content</li>
                    <li>Sell products and subscription</li>
                    <li>Grow Audience</li>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="title">
                <h3>Share every type of content<br>in limitless ways</h3>
                <p>Join 70M+ people using Linktree for their link in bio. One link to help  you share everything you create, curate and sell from your Instagram,  TikTok, Twitter, YouTube and other social media profiles.</p>
            </div>
            <ul>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
        <div class="monetize">
            <div class="title">
                <h3>Sell products, collect payments<br>and monetize content</h3>
                <p>Join 70M+ people using Linktree for their link in bio. One link to help  you share everything you create, curate and sell from your Instagram,  TikTok, Twitter, YouTube and other social media profiles.</p>
            </div>
            <ul>
                <li>Design & Content</li>
                <li>Sell products and subscription</li>
                <li>Grow Audience</li>
            </ul>
        </div>
    </section>
</template>


<style scoped>
section {
    .create {
        max-width: 80em;
        margin: auto;
        padding: 16em 2em;
        display: flex;
        gap: 8em;
        .title {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2em;
            flex: 1;
            h3 {
                font-size: 3em;
                line-height: 1;
                max-width: 18ch;
            }
        }
        ul {
            flex: 1;
        }
    }
    .content {
        width: 100vw;
        overflow: hidden;
        margin: auto;
        padding: 16em 2em;
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        gap: 8em;
        .title {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2em;
            flex: 1;
            h3 {
                font-size: 3em;
                line-height: 1;
            }
            p {
                max-width: 50ch;
            }
        }
        ul {
            display: flex;
            flex: 1;
            gap: 2em;
            li {
                background: red;
                aspect-ratio: 1;
                height: 20em;
                border-radius: 1em;
            }
        }
    }
    .monetize {
        max-width: 80em;
        margin: auto;
        padding: 16em 2em;
        display: flex;
        flex-direction: column;
        text-align: center;
        align-items: center;
        gap: 8em;
        .title {
            display: flex;
            flex-direction: column;
            gap: 2em;
            flex: 1;
            h3 {
                font-size: 3em;
                line-height: 1;
            }
            p {
                max-width: 50ch;
            }
        }
        ul {
            flex: 1;
        }
    }
}
</style>