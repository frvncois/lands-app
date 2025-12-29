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
                <ul>
                    <li class="blue">
                        <div>
                            <h3>Design</h3>
                            <h4>Customize every aspect of your site</h4>
                            <p>with our intuitive design tools.</p>
                        </div>
                    </li>
                    <li class="green">
                        <h3>Content</h3>
                        <p>Add images, videos, text, and more to showcase your brand effectively.</p>
                    </li>
                    <li class="red">
                        <h3>Audience</h3>
                        <p>Track your site's performance with built-in analytics and insights.</p>
                    </li>
                    <li class="yellow">
                        <h3>Translate</h3>
                        <p>Track your site's performance with built-in analytics and insights.</p>
                    </li>
                    <li class="purple">
                        <h3>Collaborate</h3>
                        <p>Optimize your site for search engines to increase visibility and reach.</p>
                    </li>
                    <li class="dark">
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
            justify-content: space-evenly;
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
        margin: auto;
        max-width: none;
            > div {
                flex: 1;
                > ul {
                    margin: 0;
                    padding: 0;
                }
                > ul li {
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    flex-direction: row;
                    gap: 3em;
                    padding: 10em;
                    list-style: none;
                    > div {
                        display: flex;
                        flex: 1;
                        flex-direction: column;
                        gap: 5em;
                    }
                    & p {
                        font-size: 5em;
                        line-height: 0.9;
                    }
                    & h3 {
                        font-size: 1.5em;
                        line-height: 1;
                        text-transform: uppercase;
                    }
                }
                .blue {
                    background: #155dfc;
                }
                .green {
                    background: #00d492;
                }
                .red {
                    background: #ff6467;
                }
                .yellow {
                    background: #fff085;
                }
                .purple {
                    background: #ad46ff;
                }
                .dark {
                    background: #171717;
                }
            }
        
    }
</style>
