// Layout Components
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './main/Footer'; // Fixed: Changed from './layout/Footer' to './main/Footer'

// Section Components
export { default as HeroSection } from './sections/HeroSection';
export { default as PropertyGrid } from './sections/PropertyGrid';
export { default as MapListingsLayout } from './sections/MapListingsLayout';
export { default as CTASection } from './sections/CTASection';
export { default as TestimonialSlider } from './sections/TestimonialSlider';

// UI Components
export { default as PropertyCard } from './ui/PropertyCard';
export { default as Loader } from './ui/Loader';
export { default as FilterBar } from './ui/FilterBar';
export { default as ContactForm } from './ui/ContactForm';

// Loading and Error Components
export {
  PropertyCardSkeleton,
  PropertyGridSkeleton,
  PropertyDetailSkeleton,
  TestimonialSkeleton,
  AgentCardSkeleton,
  FormSkeleton,
  TableSkeleton,
  HeroSkeleton,
  StatsSkeleton
} from './ui/LoadingSkeleton';

export {
  ErrorMessage,
  NetworkError,
  LoadingError
} from './ui/ErrorMessage';

// NoResults components
export { default as NoResults, PropertyNoResults, SearchNoResults } from './reusable/NoResults';

// Reusable Components (existing)
export { default as Pagination } from './reusable/Pagination';
export { default as RangeSlider } from './reusable/RangeSlider';
export { default as LocationSearch } from './reusable/LocationSearch';
export { default as PropertyCarousel } from './reusable/PropertyCarousel';
export { default as MapPlaceholder } from './reusable/MapPlaceholder';
export { default as PropertyMap } from './reusable/PropertyMap';
export { default as SimilarProperties } from './reusable/SimilarProperties';
export { Button } from './reusable/Button';
export { default as Modal } from './reusable/Modal';
export { default as Alert } from './reusable/Alert';
export { default as InputField } from './reusable/InputField';
export { default as TextArea } from './reusable/TextArea';
export { default as Checkbox } from './reusable/Checkbox';
export { default as DatePicker } from './reusable/DatePicker';
export { default as TimeSlotSelector } from './reusable/TimeSlotSelector';
export { default as ProgressStepper } from './reusable/ProgressStepper';
export { default as StepCard } from './reusable/StepCard';
export { default as OfferForm } from './reusable/OfferForm';
export { default as OfferResultCard } from './reusable/OfferResultCard';
export { default as FeeBreakdown } from './reusable/FeeBreakdown';
export { default as AddonCard } from './reusable/AddonCard';
export { default as Checklist } from './reusable/Checklist';
export { default as SearchBar } from './reusable/SearchBar';
export { default as HowItWorks } from './reusable/HowItWorks';
export { default as TrustStrip } from './reusable/TrustStrip';
export { default as TestimonialCarousel } from './reusable/TestimonialCarousel';
export { default as StickyCTA } from './reusable/StickyCTA';
export { default as ContactAgentForm } from './reusable/ContactAgentForm';
export { default as NotificationPanel } from './reusable/NotificationPanel';
export { default as Card } from './reusable/Card';
