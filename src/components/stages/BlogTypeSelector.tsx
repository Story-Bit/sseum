'use client';

import React from 'react';
import { ArrowLeft, User, Info, Star, BarChart3 } from 'lucide-react';

const types = [
    { id: '일상/취미', name: '일상/취미', icon: <User />, description: '개인의 경험, 후기, 꿀팁 등 공감대를 형성하는 글 (1,000~1,500자)' },
    { id: '정보성 콘텐츠', name: '정보성 콘텐츠', icon: <Info />, description: '특정 주제에 대한 명확한 정보를 논리적으로 전달하는 글 (1,500~2,500자)' },
    { id: '제품 리뷰/심층 가이드', name: '제품 리뷰/가이드', icon: <Star />, description: '제품/서비스를 깊이 있게 분석하고 실용적인 정보를 제공하는 글 (2,000~3,000자)' },
    { id: '전문가 분석/보고서', name: '전문가 분석/보고서', icon: <BarChart3 />, description: '전문 지식과 데이터를 바탕으로 통찰력을 제공하는 심도 있는 글 (3,000자 이상)' },
];

interface BlogTypeSelectorProps {
  onSelect: (type: string) => void;
  onBack: () => void;
}

const BlogTypeSelector: React.FC<BlogTypeSelectorProps> = ({ onSelect, onBack }) => {
    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4"/> 다른 전략 선택
            </button>
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">어떤 종류의 글을 작성할까요?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {types.map(type => (
                    <div key={type.id} onClick={() => onSelect(type.id)} className="p-6 text-left bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all duration-300">
                        <div className="flex items-center mb-2">
                            <div className="text-blue-500 bg-blue-100 p-2 rounded-full mr-3">{type.icon}</div>
                            <h4 className="text-lg font-bold text-gray-800">{type.name}</h4>
                        </div>
                        <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogTypeSelector;