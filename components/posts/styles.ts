const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  gridWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  column: {
    flex: 1, // حتماً باید flex: 1 باشد تا عرض ستون در iOS محاسبه شود
    marginHorizontal: 3,
    // [مهم برای iOS]: اگر ارتفاع ستون بسته بماند، عکس‌ها لود نمی‌شوند. 
    // پس flexDirection ستون را عمودی بگذارید:
    flexDirection: 'column', 
  },
  cardItemHolder: {
    width: '100%',
    marginBottom: 10,
  },
});