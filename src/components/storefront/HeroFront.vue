<template>
    <section>
        <ul>
            <li><h1><span>Microsite Builder</span></h1></li>
            <li>
                <div>
                    <h2>One page that</h2>
                    <h3>Does everything</h3>
                </div>
            </li>
            <li><p>Build a microsite for your brand, drop, event, service list, link-in-bio, presave, promo, or anything else — all in minutes, with a designer finish.</p></li>
            <li>
                <a href="#">Get Started</a>
                <h4>Start for free. No credit card required.</h4>
            </li>
        </ul>
    </section>
</template>

<style scoped>
    section {
        max-width: 1200px;
        margin: auto;
        padding: 8em 4em;
    }
    h1 {
        font-size: 0.75em;
        text-transform: uppercase;
        border: 1px solid gray;
        border-radius: 3em;
        padding: 0 0.5em;
    }
    h2, h3 {
        font-size: 6em;
        line-height: 0.8;
        text-transform: uppercase;
    }
    p {
        max-width: 35ch;
        text-align: center;
    }
    ul {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5em;
        min-height: 55svh;
    }
    li:last-of-type {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        & h4 {
            font-size: 0.75em;
            color: gray;
        }
    }
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    a {
        text-decoration: none;
        padding: 0.75em 2em;
        border-radius: 2em;
        text-transform: uppercase;
        margin: 0 1em;
        text-align: center;
        background: black;
        color: white;
    }
</style>