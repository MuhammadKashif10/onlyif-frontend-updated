const goToPrevious = () => {
  setCurrentIndex((prevIndex) => (prevIndex - 1 + safeImages.length) % safeImages.length);
};

const goToNext = () => {
  setCurrentIndex((prevIndex) => (prevIndex + 1) % safeImages.length);
};