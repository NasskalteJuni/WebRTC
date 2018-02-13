<template>
    <v-layout row wrap>
        <v-flex xs8 offset-xs1>
            <article v-html="agb"></article>
            <article>
                <h2 id="faq">FAQ</h2>
                <ol>
                    <li v-for="(item, i) in faqs" :key="i">
                        <strong v-html="item.Q"></strong><br>
                        <p v-html="item.A"></p>
                    </li>
                </ol>
            </article>
        </v-flex>
    </v-layout>
</template>

<script>
    import faqs from '../texts/faq.txt';
    import agb from '../texts/agb.txt';
    import faqProcessing from '../helpers/faqProcessing'

    export default {
        name: "about",
        data(){
            return {
                agb: agb,
                faqs: faqProcessing(faqs)
            }
        }
    }
</script>

<style scoped>

</style>