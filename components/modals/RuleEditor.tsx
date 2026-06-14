/**
 * RuleEditor Component
 * 분류 규칙 및 제품 추천 규칙 편집을 위한 UI 컴포넌트
 */

import React, { useState, useCallback } from 'react';
import { CareType } from '../../types';
import {
    LogicCondition,
    ClassificationRule,
    ProductRecommendationRule,
    AVAILABLE_FIELDS,
    CARE_TYPE_LABELS
} from '../../logicEngine';
import { PRODUCTS } from '../../data/products';

interface RuleEditorProps {
    type: 'classification' | 'product';
    rules: (ClassificationRule | ProductRecommendationRule)[];
    onSave: (rules: any[]) => void;
    onClose: () => void;
}

// 연산자 옵션
const OPERATORS = [
    { value: '>=', label: '>= (이상)' },
    { value: '<=', label: '<= (이하)' },
    { value: '>', label: '> (초과)' },
    { value: '<', label: '< (미만)' },
    { value: '==', label: '== (같음)' },
    { value: '!=', label: '!= (다름)' },
];

// 필드 선택 컴포넌트
const FieldSelector: React.FC<{
    value: string;
    onChange: (field: string) => void;
}> = ({ value, onChange }) => {
    const categories = Object.keys(AVAILABLE_FIELDS) as (keyof typeof AVAILABLE_FIELDS)[];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
            <option value="">필드 선택...</option>
            {categories.map(cat => (
                <optgroup key={cat} label={cat.toUpperCase()}>
                    {AVAILABLE_FIELDS[cat].map(field => (
                        <option key={`${cat}.${field.key}`} value={`${cat}.${field.key}`}>
                            {field.label}
                        </option>
                    ))}
                </optgroup>
            ))}
        </select>
    );
};

// 조건 편집기
const ConditionEditor: React.FC<{
    condition: LogicCondition;
    onChange: (condition: LogicCondition) => void;
    onDelete: () => void;
}> = ({ condition, onChange, onDelete }) => {
    return (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <FieldSelector
                value={condition.field}
                onChange={(field) => onChange({ ...condition, field })}
            />
            <select
                value={condition.operator}
                onChange={(e) => onChange({ ...condition, operator: e.target.value as any })}
                className="p-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
                {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                ))}
            </select>
            <input
                type="text"
                value={String(condition.value)}
                onChange={(e) => {
                    const val = e.target.value;
                    // 숫자인지 확인
                    const numVal = Number(val);
                    onChange({
                        ...condition,
                        value: !isNaN(numVal) && val !== '' ? numVal : val === 'true' ? true : val === 'false' ? false : val
                    });
                }}
                placeholder="값"
                className="w-24 p-2 border border-slate-200 rounded-lg text-sm"
            />
            <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
                ✕
            </button>
        </div>
    );
};

// 분류 규칙 편집기
const ClassificationRuleEditor: React.FC<{
    rule: ClassificationRule;
    onChange: (rule: ClassificationRule) => void;
    onDelete: () => void;
}> = ({ rule, onChange, onDelete }) => {
    const [expanded, setExpanded] = useState(false);

    const addCondition = () => {
        onChange({
            ...rule,
            conditions: [...rule.conditions, { field: '', operator: '>=', value: 0 }]
        });
    };

    const updateCondition = (index: number, condition: LogicCondition) => {
        const newConditions = [...rule.conditions];
        newConditions[index] = condition;
        onChange({ ...rule, conditions: newConditions });
    };

    const deleteCondition = (index: number) => {
        onChange({
            ...rule,
            conditions: rule.conditions.filter((_, i) => i !== index)
        });
    };

    const label = CARE_TYPE_LABELS[rule.result];

    return (
        <div className={`border rounded-xl overflow-hidden ${rule.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div
                className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{label?.icon || '📋'}</span>
                    <div>
                        <h4 className="font-bold text-slate-800">{rule.nameKr}</h4>
                        <p className="text-xs text-slate-500">{label?.description || rule.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {rule.enabled ? '활성' : '비활성'}
                    </span>
                    <span className="text-xs text-slate-400">우선순위: {rule.priority}</span>
                    <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
                </div>
            </div>

            {expanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                    {/* 기본 설정 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">활성화</label>
                            <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
                                className="w-5 h-5"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">우선순위</label>
                            <input
                                type="number"
                                value={rule.priority}
                                onChange={(e) => onChange({ ...rule, priority: Number(e.target.value) })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">조합기</label>
                            <select
                                value={rule.combinator}
                                onChange={(e) => onChange({ ...rule, combinator: e.target.value as 'AND' | 'OR' })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                            >
                                <option value="AND">AND (모두 충족)</option>
                                <option value="OR">OR (하나라도 충족)</option>
                            </select>
                        </div>
                    </div>

                    {/* 조건 목록 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500">조건 ({rule.conditions.length}개)</label>
                            <button
                                onClick={addCondition}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                + 조건 추가
                            </button>
                        </div>
                        <div className="space-y-2">
                            {rule.conditions.map((cond, i) => (
                                <ConditionEditor
                                    key={i}
                                    condition={cond}
                                    onChange={(c) => updateCondition(i, c)}
                                    onDelete={() => deleteCondition(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={onDelete}
                            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            규칙 삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 제품 추천 규칙 편집기
const ProductRuleEditor: React.FC<{
    rule: ProductRecommendationRule;
    onChange: (rule: ProductRecommendationRule) => void;
    onDelete: () => void;
}> = ({ rule, onChange, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const product = PRODUCTS[rule.productId];

    const addCondition = () => {
        onChange({
            ...rule,
            conditions: [...rule.conditions, { field: '', operator: '>=', value: 0 }]
        });
    };

    const updateCondition = (index: number, condition: LogicCondition) => {
        const newConditions = [...rule.conditions];
        newConditions[index] = condition;
        onChange({ ...rule, conditions: newConditions });
    };

    const deleteCondition = (index: number) => {
        onChange({
            ...rule,
            conditions: rule.conditions.filter((_, i) => i !== index)
        });
    };

    return (
        <div className={`border rounded-xl overflow-hidden ${rule.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div
                className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-slate-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                        💊
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{rule.productName}</h4>
                        <p className="text-xs text-slate-500">{product?.name || rule.productId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {rule.enabled ? '활성' : '비활성'}
                    </span>
                    <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
                </div>
            </div>

            {expanded && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                    {/* 기본 설정 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">활성화</label>
                            <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
                                className="w-5 h-5"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">제품 ID</label>
                            <select
                                value={rule.productId}
                                onChange={(e) => {
                                    const prod = PRODUCTS[e.target.value];
                                    onChange({
                                        ...rule,
                                        productId: e.target.value,
                                        productName: prod?.name || e.target.value
                                    });
                                }}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                            >
                                {Object.entries(PRODUCTS).map(([id, p]) => (
                                    <option key={id} value={id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 block mb-1">조합기</label>
                            <select
                                value={rule.combinator}
                                onChange={(e) => onChange({ ...rule, combinator: e.target.value as 'AND' | 'OR' })}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                            >
                                <option value="AND">AND (모두 충족)</option>
                                <option value="OR">OR (하나라도 충족)</option>
                            </select>
                        </div>
                    </div>

                    {/* 조건 목록 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500">적용 조건 ({rule.conditions.length}개)</label>
                            <button
                                onClick={addCondition}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                + 조건 추가
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">
                            💡 이 조건을 충족할 때 해당 제품이 추천됩니다.
                        </p>
                        <div className="space-y-2">
                            {rule.conditions.map((cond, i) => (
                                <ConditionEditor
                                    key={i}
                                    condition={cond}
                                    onChange={(c) => updateCondition(i, c)}
                                    onDelete={() => deleteCondition(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={onDelete}
                            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            규칙 삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 메인 RuleEditor 컴포넌트
export const RuleEditor: React.FC<RuleEditorProps> = ({ type, rules, onSave, onClose }) => {
    const [editedRules, setEditedRules] = useState<any[]>([...rules]);
    const [searchTerm, setSearchTerm] = useState('');

    const addNewRule = () => {
        if (type === 'classification') {
            const newRule: ClassificationRule = {
                id: `rule_${Date.now()}`,
                name: 'NEW_RULE',
                nameKr: '새 분류 규칙',
                conditions: [],
                combinator: 'AND',
                result: CareType.HEALTHY,
                priority: editedRules.length + 1,
                enabled: true
            };
            setEditedRules([...editedRules, newRule]);
        } else {
            const newRule: ProductRecommendationRule = {
                id: `prod_${Date.now()}`,
                productId: 'immune_one',
                productName: '새 제품 규칙',
                conditions: [],
                combinator: 'AND',
                enabled: true
            };
            setEditedRules([...editedRules, newRule]);
        }
    };

    const updateRule = (index: number, rule: any) => {
        const newRules = [...editedRules];
        newRules[index] = rule;
        setEditedRules(newRules);
    };

    const deleteRule = (index: number) => {
        setEditedRules(editedRules.filter((_, i) => i !== index));
    };

    const filteredRules = editedRules.filter(rule => {
        const name = type === 'classification' ? (rule as ClassificationRule).nameKr : (rule as ProductRecommendationRule).productName;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* 헤더 */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-800">
                                {type === 'classification' ? '📊 진단 분류 규칙 편집' : '💊 제품 추천 규칙 편집'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {type === 'classification'
                                    ? '각 분류의 조건과 우선순위를 설정할 수 있습니다.'
                                    : '제품이 추천되는 조건을 자세히 설정할 수 있습니다.'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
                    </div>

                    {/* 검색 및 추가 */}
                    <div className="flex items-center gap-4 mt-4">
                        <input
                            type="text"
                            placeholder="규칙 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                        />
                        <button
                            onClick={addNewRule}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                        >
                            + 새 규칙 추가
                        </button>
                    </div>
                </div>

                {/* 규칙 목록 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {filteredRules.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-4xl mb-4">📭</p>
                            <p>등록된 규칙이 없습니다.</p>
                        </div>
                    ) : (
                        filteredRules.map((rule, index) =>
                            type === 'classification' ? (
                                <ClassificationRuleEditor
                                    key={rule.id}
                                    rule={rule as ClassificationRule}
                                    onChange={(r) => updateRule(editedRules.indexOf(rule), r)}
                                    onDelete={() => deleteRule(editedRules.indexOf(rule))}
                                />
                            ) : (
                                <ProductRuleEditor
                                    key={rule.id}
                                    rule={rule as ProductRecommendationRule}
                                    onChange={(r) => updateRule(editedRules.indexOf(rule), r)}
                                    onDelete={() => deleteRule(editedRules.indexOf(rule))}
                                />
                            )
                        )
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-6 border-t border-slate-100 flex justify-between">
                    <p className="text-xs text-slate-400">
                        총 {editedRules.length}개 규칙 | 활성: {editedRules.filter(r => r.enabled).length}개
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => {
                                onSave(editedRules);
                                onClose();
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleEditor;
