"use client";

import React, { useEffect, useState, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronUp, Leaf, Bird, Trees as Tree, Star } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// Компонент Skeleton для загрузки
const LoadingSkeleton = () => (
  <>
    <Skeleton className="h-[60vh] bg-gray-200 rounded-lg mb-4" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Skeleton className="w-12 h-12 bg-gray-200 mb-4" />
          <Skeleton className="h-6 bg-gray-200 rounded mb-2" />
          <Skeleton className="h-4 bg-gray-200 rounded mb-2" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Skeleton className="w-12 h-12 bg-gray-200 mb-4" />
          <Skeleton className="h-6 bg-gray-200 rounded mb-2" />
          <Skeleton className="h-4 bg-gray-200 rounded mb-2" />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <Skeleton className="w-12 h-12 bg-gray-200 mb-4" />
          <Skeleton className="h-6 bg-gray-200 rounded mb-2" />
          <Skeleton className="h-4 bg-gray-200 rounded mb-2" />
        </div>
      </motion.div>
      <h2 className="mt-6 text-xl font-semibold text-gray-800 mb-4">
        Дополнительные изображения
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 bg-gray-200 rounded-lg mb-4" />
        <Skeleton className="h-64 bg-gray-200 rounded-lg mb-4" />
        <Skeleton className="h-64 bg-gray-200 rounded-lg mb-4" />
      </div>
    </div>
  </>
);

// Компонент для отображения рейтинга в звездах
const StarRating = ({ rating, setRating }: { rating: number, setRating?: (rating: number) => void }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          onClick={() => setRating && setRating(star)}
        />
      ))}
    </div>
  );
};

// Компонент отзывов
const ReviewSection = ({ reserveId }: { reserveId: Id<"reserves"> }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const createReview = useMutation(api.reserves.createReview);
  const reviews = useQuery(api.reserves.getReserveReviews, { reserveId });
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error("Пожалуйста, введите текст отзыва");
      return;
    }

    try {
      await createReview({ reserveId, rating, text: reviewText });
      toast.success("Отзыв успешно добавлен");
      setReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Ошибка при добавлении отзыва:", error);
      toast.error("Ошибка при добавлении отзыва");
    }
  };

  return (
    <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-emerald-800">Отзывы</h2>
      
      {isAuthenticated ? (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Оставить отзыв</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">Ваша оценка</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <Textarea 
            placeholder="Поделитесь своими впечатлениями о заповеднике..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="mb-2"
            rows={4}
          />
          <Button onClick={handleSubmitReview}>Отправить отзыв</Button>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
          <p>Войдите, чтобы оставить отзыв</p>
          <Button variant="outline" className="mt-2" onClick={() => router.push('/signin')}>
            Войти
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {!reviews?.length && <p className="text-gray-500">Отзывов пока нет</p>}
        
        {reviews?.map((review) => (
          <div key={review._id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="bg-emerald-100 text-emerald-800 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{review.userName}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
            <StarRating rating={review.rating} />
            <p className="mt-2">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Reserve {
  _id: Id<"reserves">;
  name: string;
  description: string;
  region: string;
  yearFounded: number;
  flora: string[];
  fauna: string[];
  imageUrl?: string | null;
  additionalImages?: string[];
}

export default function ReserveDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [reserve, setReserve] = useState<Reserve | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const reserveData = useQuery(api.reserves.getReserve, {
    reserveId: id as Id<"reserves">,
  });

  useEffect(() => {
    if (reserveData) {
      setReserve({
        _id: reserveData._id,
        name: reserveData.name,
        description: reserveData.description,
        region: reserveData.region,
        yearFounded: reserveData.yearFounded,
        flora: reserveData.flora,
        fauna: reserveData.fauna,
        imageUrl: reserveData.imageUrl,
        additionalImages: reserveData.additionalImages?.filter(
          (image): image is string => image !== null,
        ),
      });
    }
  }, [reserveData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!reserve) return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <LoadingSkeleton />
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.div style={{ opacity }} className="absolute inset-0">
          <div className="relative">
            <Image
              src={reserve.imageUrl ?? ""}
              alt="Hero image"
              className="w-full h-full object-cover"
              width={1000}
              height={1000}
            />
            <div className="absolute inset-0 bg-black opacity-30" />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-4xl md:text-6xl font-bold mb-4"
            >
              {reserve.name}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl max-w-2xl mx-auto px-4"
            >
              {reserve.description}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Section */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Leaf className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Регион</h3>
            <p className="text-gray-600">{reserve.region}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Tree className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Год основания</h3>
            <p className="text-gray-600">{reserve.yearFounded}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Bird className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Разновидности</h3>
            <p className="text-gray-600">
              {reserve.flora.length + reserve.fauna.length} задокументированных
              видов
            </p>
          </div>
        </motion.div>

        {/* Flora & Fauna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-emerald-800">
              Флора
            </h2>
            <ul className="space-y-3">
              {reserve.flora.map((item: string, index: number) => (
                <li key={index} className="flex items-center text-gray-700">
                  <Leaf className="w-5 h-5 text-emerald-500 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-emerald-800">
              Фауна
            </h2>
            <ul className="space-y-3">
              {reserve.fauna.map((item: string, index: number) => (
                <li key={index} className="flex items-center text-gray-700">
                  <Bird className="w-5 h-5 text-emerald-500 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Image Gallery */}
        <h2 className="mt-6 text-xl font-semibold text-gray-800 mb-4">
          Дополнительные изображения
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reserve.additionalImages?.map((image: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <label
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"
                aria-label={`Дополнительное изображение ${index + 1}`}
              />
              <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={image}
                  alt={`Дополнительное изображение ${index + 1}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={1000}
                  height={1000}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ReviewSection reserveId={reserve._id} />
      </div>

      {/* Back to Top Button */}
      {showTopButton && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
