<template>
    <section>
        <div class="container">
            <div>
                <h2>Build better</h2>
                <ul>
                    <li><p>Link-in-bio</p></li>
                    <li><p>Digital showcase</p></li>
                    <li><p>Event promo</p></li>
                    <li><p>Product landing</p></li>
                    <li><p>Service page</p></li>
                    <li><p>Presave page</p></li>
                </ul>
            </div>
        </div>
    </section>
</template>

<style scoped>
    section {
        background: black;
        color: white;
        padding-top: 30em;
        margin-top: -20em;
    }
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        max-width: 1800px;
        margin: auto;
        padding: 0 4em;
        > div {
            flex: 1;
            > h2, p {
                font-size: 10em;
                line-height: 1;
                text-transform: uppercase;
            }
            > ul {
                height: 10em;
                overflow: hidden;
                margin-bottom: 10em;
            }
        }
    }
</style>