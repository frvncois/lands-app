<template>
    <section>
        <h1>Structured publishing</h1>
        <h2>
        Publish a microsite that<br>actually looks <span>credible</span>
        </h2>
        <p>
        Turn your content into a structured page that feels clear, intentional, and built to convert. No design skills, no endless tweaking — just a layout that makes you look sharp from the start.
        </p>
        <div class="input">
            <input placeholder="your-project"/><button>Get yours <span>→</span></button>
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
    font-size: 6em;
    line-height: 1;
}
p {
    max-width: 50ch;
}
input {
    color: black;
    font-size: 1.5em;
    padding: 0.5em 1em;
}
.input {
    background: white;
    border-radius: 5em;
    padding: 0.25em;
}
button {
    background: black;
    font-size: 1.5em;
    padding: 0.5em 1em;
    border-radius: 5em;
}
</style>