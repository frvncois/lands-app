<template>
    <section>
        <ul>
            <li><h3>Publish<br> your content</h3></li>
            <li><h3>Sell and<br> monetize</h3></li>
            <li><h3>Grow<br> your Audience</h3></li>
        </ul>

    </section>
</template>


<style scoped>
section {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: end;
    margin-top: -20em;
    ul {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        flex: 1;
        gap: 2em;
        padding: 2em;
        li {
            display: flex;
            align-items: end;
            padding: 2em;
            background: rgb(240, 240, 240);
            color: black;
            height: 40em;
            border-radius: 1.5em;    
            h3 {
                font-size: 3em;
                line-height: 0.9;
            }
        }
    }
}
</style>