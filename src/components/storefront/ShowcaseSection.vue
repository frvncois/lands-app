<template>
    <section>
        <div>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
            <img src="@/assets/hero-phone.png"/>
        </div>
        <div class="blur-bottom"></div>
    </section>
</template>

<style scoped>
section {
    margin-top: -10em;
    height: 95vh;
    background: black;
    overflow: hidden;
    position: relative;
    img {
        width: 100%;
    }
    div {
        display: flex;
        gap: 2em;
        position: relative;
        justify-content: center;
        align-items: start;
        flex: 1;
        img {
            position: absolute;
            top: 0;
            width: 25em;
            margin: auto;
                &:nth-child(1) {
                    margin-left: -55%;
                    transform: scale(0.65);
                    filter: blur(10px) brightness(25%);
                    z-index: 1;
                }
                &:nth-child(2) {
                    margin-left: -35%;
                    transform: scale(0.85);
                    filter: blur(3px) brightness(45%);
                    z-index: 2;
                }
                &:nth-child(3) {
                    margin-left: -18%;
                    transform: scale(0.95);
                    filter: blur(1px) brightness(75%);
                    z-index: 3;
                }
                &:nth-child(4) {
                    z-index: 4;
                }
                &:nth-child(5) {
                    margin-left: 18%;
                    transform: scale(0.95);
                    filter: blur(1px) brightness(75%);
                    z-index: 3;
                }
                &:nth-child(6) {
                    margin-left: 35%;
                    transform: scale(0.85);
                    filter: blur(3px) brightness(45%);
                    z-index: 2;
                }
                &:nth-child(7) {
                    margin-left: 55%;
                    transform: scale(0.65);
                    filter: blur(10px) brightness(25%);
                    z-index: 1;
                }

        }
    }
    .blur-bottom {
        position: absolute;
        bottom: -12em;
        left: 0;
        right: 0;
        height: 40em;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(20px);
        mask-image: linear-gradient(to bottom, transparent 0%, black 25%);
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 25%);
        pointer-events: none;
        z-index: 10;
    }
}
</style>