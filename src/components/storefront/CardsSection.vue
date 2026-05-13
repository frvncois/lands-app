<template>
    <section>
        <div class="panel">
            <div>
                <h1>Build a custom microsite</h1>
            </div>
            <video src="/demo.webm" autoplay muted loop />
        </div>
    </section>
</template>

<style lang="css" scoped>
section {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    height: 100vh;
}
.panel {
    display: flex;
    gap: 2em;
    flex: 1;
    padding: 2em;
    div {
        flex: 1;
        > h1 {
            font-size: 10vw;
            line-height: 0.9;
            color: white;
        }
    }
    video {
        position: absolute;
        border-radius: 1.5em;
        height: 80%;
        object-fit: cover;
        left: auto;
        right: 0;
        top: 0;
        bottom: 0;
    }
}
</style>