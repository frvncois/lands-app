<template>
    <section>
        <div class="marquee">
            <ul>
                <li><p>Online within minutes</p></li>
                <li><p>Full design control</p></li>
                <li><p>Essential content</p></li>
                <li><p>No skills required</p></li>
            </ul>
        </div>
        <div class="container">
            <div>
                <h2>Powerful features</h2>
                <p>Everything you need to create a stunning online presence.</p>
                <ul>
                    <li>
                        <h3>Design</h3>
                        <p>Customize every aspect of your site with our intuitive design tools.</p>
                    </li>
                    <li>
                        <h3>Content</h3>
                        <p>Add images, videos, text, and more to showcase your brand effectively.</p>
                    </li>
                    <li>
                        <h3>Audience</h3>
                        <p>Track your site's performance with built-in analytics and insights.</p>
                    </li>
                    <li>
                        <h3>Translate</h3>
                        <p>Track your site's performance with built-in analytics and insights.</p>
                    </li>
                    <li>
                        <h3>Collaborate</h3>
                        <p>Optimize your site for search engines to increase visibility and reach.</p>
                    </li>
                    <li>
                        <h3>Publish</h3>
                        <p>Optimize your site for search engines to increase visibility and reach.</p>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<style scoped>
    section {
        background: white;
        color: black;
    }
    .marquee {
        overflow: hidden;
        ul {
            display: flex;
            gap: 4em;
            border-bottom: 1px solid black;
            padding: 2em 0;
            li p {
                font-size: 1em;
                text-transform: uppercase;
            }
        }
    }
    .container {
        display: flex;
        max-width: 1800px;
        margin: auto;
        padding: 10em;
            > div {
                flex: 1;
            }
            & h2 {
                font-size: 5em;
                line-height: 1;
                text-transform: uppercase;
            }
            > ul {
                height: 10em;
                overflow: hidden;
                margin-bottom: 10em;
            }
        
    }
</style>