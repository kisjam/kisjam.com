<template>
	<div class="counter">
		<p>Count: {{ count }}</p>
		<button @click="increment">Increments</button>
	</div>
</template>

<script>
export default {
	name: "VueComponent",
	data() {
		return {
			count: 0,
		};
	},
	methods: {
		increment() {
			this.count++;
		},
	},
};
</script>
