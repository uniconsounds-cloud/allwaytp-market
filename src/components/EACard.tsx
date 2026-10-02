"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck } from "lucide-react";

export interface EAItem {
  code: string;
  name: string;
  images: string[];
  badge: string;
  badgeColor: string;
  description: string;
  pair: string;
  timeframe: string;
  minDeposit: string;
  type: string;
  tagline: string;
  features: string[];
  version?: string;
}

export default function EACard({ ea }: { ea: EAItem }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const currentImage = ea.images[activeImgIndex] || ea.images[0];

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-surface-100 border border-gray-800 hover:border-gold-500/50 p-6 sm:p-7 transition-all hover:shadow-2xl hover:shadow-amber-950/20 group">
      <div>
        {/* Main Product Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 bg-black/60 border border-gray-800 group-hover:border-gold-500/30 transition-colors">
          <img 
            src={currentImage} 
            alt={ea.name} 
            className="w-full h-full object-cover object-center transition-all duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent opacity-60" />
          
          {/* Badge floating on top of image */}
          <div className="absolute top-3 left-3">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md ${ea.badgeColor}`}>
              {ea.badge}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-gray-300 font-mono">
            <span className="bg-black/70 px-2 py-0.5 rounded border border-gray-700/60 font-semibold text-[#D4AF37]">
              {ea.tagline}
            </span>
            <span className="text-gray-400">v{ea.version || "1.0.0"}</span>
          </div>
        </div>

        {/* 3-Image Thumbnail Selector */}
        {ea.images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {ea.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all p-0.5 bg-black/60 ${
                  activeImgIndex === idx
                    ? "border-amber-400 scale-105 shadow-md shadow-amber-500/30"
                    : "border-gray-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`${ea.name} view ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
              </button>
            ))}
          </div>
        )}

        <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors">
          {ea.name}
        </h3>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed min-h-[55px]">
          {ea.description}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0C0E14] border border-gray-800/80 mb-6 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">สินทรัพย์ / คู่เงิน</span>
            <span className="font-semibold text-gray-200">{ea.pair}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Timeframe</span>
            <span className="font-semibold text-gray-200">{ea.timeframe}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">เงินทุนแนะนำขั้นต่ำ</span>
            <span className="font-bold text-[#D4AF37]">{ea.minDeposit}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">ประเภทบัญชี</span>
            <span className="font-semibold text-gray-200">{ea.type}</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <ul className="space-y-2.5 mb-8 text-xs text-gray-300">
          {ea.features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-4 border-t border-gray-800">
        <Link 
          href={`/register-license?ea=${ea.code}`}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>ขอสิทธิ์ใช้งาน {ea.name}</span>
        </Link>
      </div>
    </div>
  );
}
