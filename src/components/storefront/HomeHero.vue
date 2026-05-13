<template>
    <section>
        <div class="title">
            <h1>Beyond link in bio</h1>
            <h2>Publish a microsite<span>that actually looks good</span></h2>
            <div class="input">
                <input placeholder="your-project.lands.app"/><button><span>→</span></button>
            </div>
            <p>Start for free<br>No credit card required</p>
        </div>
    </section>
</template>

<style scoped>
section {
    position: relative;
    height: 100vh;
    overflow: visible;
    display: flex;
    gap: 4em;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    background: black;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
h1 {
    border: 1px solid white;
    padding: 0 0.5em;
    text-transform: uppercase;
    border-radius: 1em;
    letter-spacing: 1px;
    font-size: 0.75em;
}
h2 {
    display: flex;
    flex-direction: column;
    font-size: 7rem;
    font-family: 'Serif';
    line-height: 0.9;
    letter-spacing: 1.5px;
    > span {
        font-family: 'Serif Italic';
        font-size: 5rem;
    }
}
p {
    font-size: 0.75em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.15;
    color: rgb(176, 176, 176);
}
input {
    color: black;
    padding: 0.5em 1em;
}
.input {
    background: white;
    border-radius: 1.25em;
    padding: 0.25em;
    font-size: 1.5em;
    margin-top: 1em;
}
.title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2em;
    text-align: center;
}
.content {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: end;
    justify-content: space-between;
    gap: 2em;
    position: absolute;
    bottom: 2em;
    left: 2em;
    right: 2em;
}


    ul {
        display: flex;
        gap: 0.5em;
        font-size: 1.5em;
        li {
            background: rgb(183, 237, 91);
            color: rgb(59, 68, 57);
            padding: 0.25em 0.75em;
            border-radius: 0.75em;
        }
    }

button {
    background: black;
    padding: 0.5em 1em;
    border-radius: 1em;
}
</style>