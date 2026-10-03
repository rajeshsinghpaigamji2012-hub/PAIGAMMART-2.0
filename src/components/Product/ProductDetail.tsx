import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductReview, SellerProfile } from '../../types';
import { api } from '../../services/api';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Heart,
  ShoppingCart,
  Zap,
  MapPin,
  CheckCircle2,
  Play,
  X,
  MessageSquare,
  Award,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const {
    selectedProductId,
    setCurrentView,
    addToCart,
    wishlist,
    toggleWishlist,
    setShareProduct,
    deliveryPincode,
    setDeliveryPincode,
    showToast,
  } = useApp();

  const [productData, setProductData] = useState<{
    product: Product | null;
    reviews: ProductReview[];
    seller?: SellerProfile;
  }>({ product: null, reviews: [] });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [customPin, setCustomPin] = useState(deliveryPincode);
  const [deliveryEstimateText, setDeliveryEstimateText] = useState('Delivery in 2 - 3 Days · FREE');

  // Review submission form state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!selectedProductId) return;
    api.getProduct(selectedProductId).then((res) => {
      setProductData(res);
      if (res.product?.variants?.length) {
        setSelectedVariant(res.product.variants[0]);
      }
    });
  }, [selectedProductId]);

  const product = productData.product;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(customPin)) {
      showToast('Enter valid 6-digit Indian PIN', 'error');
      return;
    }
    setDeliveryPincode(customPin, 'Verified Area');
    setDeliveryEstimateText(`Delivery by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · FREE`);
    showToast(`PIN ${customPin} is serviceable for Express Delivery`, 'success');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please provide a title and review text', 'error');
      return;
    }
    setIsSubmittingReview(true);
    const newRev = await api.addReview({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
    setProductData((prev) => ({
      ...prev,
      reviews: [newRev, ...prev.reviews],
    }));
    setIsSubmittingReview(false);
    setIsReviewOpen(false);
    setReviewTitle('');
    setReviewComment('');
    showToast('Thank you! Your verified purchase review is live ⭐', 'success');
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-1 hover:text-amber-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Marketplace</span>
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main PDP Grid: Gallery Left, Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Gallery & Video */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {/* Video Play Badge if videoUrl is available */}
            {product.videoUrl && (
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="absolute bottom-4 left-4 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Product Video</span>
              </button>
            )}

            {/* Share & Wishlist overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShareProduct(product)}
                className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105"
                title="Share Deep Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-xl bg-white/95 hover:bg-white shadow-md transition-all hover:scale-105 ${
                  isWishlisted ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                }`}
                title="Wishlist"
              >
                <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-amber-500 shadow-xs scale-95'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust and Return Badge Strip */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <RotateCcw className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">{product.returnPolicyDays} Days Return</p>
              <p className="text-[10px] text-slate-500">Hassle-free pickup</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Fast Delivery</p>
              <p className="text-[10px] text-slate-500">BlueDart / Delhivery</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Verified Seller</p>
              <p className="text-[10px] text-slate-500">5% Fair Marketplace</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Title */}
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 leading-tight">
              {product.title}
            </h1>

            {/* Rating & Review Count */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {productData.reviews.length} Verified Customer Reviews
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Purchase Rating
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-base text-slate-400 line-through font-mono">
                ₹{currentMrp.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {product.discountPercent}% OFF
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Inclusive of all taxes. Free shipping on orders above ₹499.
            </p>
          </div>

          {/* Available Offers */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Available Marketplace Offers
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                  COUPON
                </span>
                <span>
                  Use code <strong className="font-mono">PAIGAM10</strong> for 10% instant discount up to ₹500
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">
                  BANK OFFER
                </span>
                <span>Extra 5% instant cashback on RuPay and UPI transactions</span>
              </div>
            </div>
          </div>

          {/* Variants Selector (Size / Color) */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="ml-2 font-mono text-slate-500">₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Stock */}
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Quantity:
              </label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden w-28">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-xs font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Status:
              </span>
              {currentStock > 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({currentStock} available)
                </span>
              ) : currentStock > 0 ? (
                <span className="text-xs font-bold text-amber-600">
                  Only {currentStock} left in stock - order soon
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-900">Check Delivery to your PIN Code</h4>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={customPin}
                onChange={(e) => setCustomPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN"
                className="w-36 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
              >
                Check
              </button>
            </form>
            <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>{deliveryEstimateText}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => addToCart(product, quantity, selectedVariant)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => {
                addToCart(product, quantity, selectedVariant);
                setCurrentView('checkout');
              }}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Seller Information Card */}
          <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {product.sellerBusinessName.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {product.sellerBusinessName}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Verified PaigamMart Partner · 4.8★ Seller Rating
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              5% Platform Assured
            </span>
          </div>
        </div>
      </div>

      {/* SPECIFICATIONS & DESCRIPTION TABS */}
      <div className="mt-14 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Product Details & Specifications</h3>
        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl mb-6">
          {product.description}
        </p>

        {product.specifications && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-3 hover:bg-slate-50">
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="col-span-2 text-slate-900 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RATINGS & REVIEWS SECTION */}
      <div className="mt-14 pt-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-slate-500">
              Verified buyers share their real experience with this product
            </p>
          </div>
          <button
            onClick={() => setIsReviewOpen(!isReviewOpen)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Verified Review</span>
          </button>
        </div>

        {/* Write Review Form */}
        {isReviewOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="p-5 bg-white border-2 border-amber-200 rounded-2xl mb-8 space-y-4 shadow-sm"
          >
            <h4 className="text-sm font-bold text-slate-900">Share your experience</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Rating:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        reviewRating >= star ? 'text-amber-500 fill-amber-500' : ''
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {reviewRating} out of 5 stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Headline:
              </label>
              <input
                type="text"
                placeholder="e.g. Pure authentic silk, exceeded expectations!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Review:
              </label>
              <textarea
                rows={3}
                placeholder="Describe material quality, fit, finish, delivery experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-amber-500 focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {productData.reviews.length === 0 ? (
            <p className="text-xs text-slate-400">No reviews yet. Be the first to review!</p>
          ) : (
            productData.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{rev.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold text-slate-800">{rev.userName}</span>
                  {rev.verifiedPurchase && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Modal if active */}
      {isVideoModalOpen && product.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              src={product.videoUrl}
              controls
              autoPlay
              className="w-full aspect-16/9 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
