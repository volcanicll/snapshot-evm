<template>
  <div id="connected">
    <section>
      <p>
        Connected As <b>{{ address }}</b>
      </p>
    </section>
  </div>
</template>

<script>
export default {
  props: ["address"],
};
</script>

<style></style>
