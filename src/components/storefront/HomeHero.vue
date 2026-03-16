<template>
    <section>
        <h1>Microsite builder</h1>
        <h2>A linkin bio<br>built for you</h2>
        <p>Join 70M+ people using Linktree for their link in bio. One link to help  you share everything you create, curate and sell from your Instagram,  TikTok, Twitter, YouTube and other social media profiles.</p>
        <div>
            <input placeholder="your-project"/><button>Get started <span>→</span></button>
        </div>
    </section>
</template>

<style scoped>
section {
    height: 100vh;
    display: flex;
    gap: 4em;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: black;
    color: white;
}
h1 {
    border: 1px solid white;
    padding: 0 1em;
    border-radius: 1em;
}
h2 {
    font-size: 8em;
    line-height: 1;
}
p {
    max-width: 50ch;
}
</style>