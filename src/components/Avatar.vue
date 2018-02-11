<template>
    <div class="avatar-container" :style="styled">
        <router-link :to="link" :style="styled">
            <span class="shadow" :style="styled">
                <img class="avatar" :src="image" :width="size" :height="size" :style="styled">
            </span>
        </router-link>
    </div>
</template>

<script>
    import generate from '../helpers/avatarGenerator'

    export default {
        name: "avatar",
        props: {
            name: {
                type: String
            },
            size: {
                type: Number,
                default: 300
            },
            link: {
                type: String,
                default: ""
            }
        },
        computed: {
            image(){
                return generate(this.name, this.size)
            },
            styled(){
                return 'height: '+this.size+'px; width: '+this.size+'px; min-width: '+this.size+'px; min-height: '+this.size+'px';
            }
        }
    }
</script>

<style scoped>
    .avatar-container, .avatar-container>*{
        width: 100%;
        height: 100%;
    }

    .avatar, .shadow{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: inline-block;
    }

    .shadow{
        display: inline-block;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
    }

</style>