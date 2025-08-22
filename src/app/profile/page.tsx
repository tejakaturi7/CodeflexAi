"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DumbbellIcon, CalendarIcon, PlusCircleIcon, X } from "lucide-react";

// ----------------- STATIC PLANS -----------------
const staticPlans = [
  {
    _id: "1",
    userId: "tejakaturi",
    name: "Muscle Gain",
    isActive: false,
    dietPlan: {
      dailyCalories: 2800,
      meals: [
        { name: "Breakfast", foods: ["Oatmeal with banana", "Boiled eggs", "Almonds"] },
        { name: "Lunch", foods: ["Grilled chicken breast", "Brown rice", "Steamed broccoli"] },
        { name: "Snack", foods: ["Greek yogurt", "Blueberries"] },
        { name: "Dinner", foods: ["Salmon", "Quinoa", "Spinach salad"] },
      ],
    },
    workoutPlan: {
      schedule: ["Monday", "Tuesday", "Thursday", "Friday"],
      exercises: [
        { day: "Monday", routines: [{ name: "Bench Press", sets: 4, reps: 8 }, { name: "Squats", sets: 4, reps: 10 }] },
        { day: "Tuesday", routines: [{ name: "Deadlifts", sets: 4, reps: 6 }, { name: "Pull-ups", sets: 3, reps: 12 }] },
        { day: "Thursday", routines: [{ name: "Planks", sets: 3, reps: 60 }] },
        { day: "Friday", routines: [{ name: "Bench Press", sets: 4, reps: 8 }, { name: "Squats", sets: 4, reps: 10 }] },
      ],
    },
  },
];

// ----------------- HEALTH ISSUES -----------------
const healthIssuesList = [
  "Diabetes (Type 1)", "Diabetes (Type 2)", "Prediabetes", "Hypertension (High Blood Pressure)",
  "Hypotension (Low Blood Pressure)", "PCOS (Polycystic Ovary Syndrome)", "Endometriosis",
  "Thyroid Disorder - Hypothyroidism", "Thyroid Disorder - Hyperthyroidism",
  "High Cholesterol (Hyperlipidemia)", "Obesity", "Overweight", "Underweight", "Metabolic Syndrome",
  "Heart Disease", "Coronary Artery Disease", "Arrhythmia", "Congestive Heart Failure", "Asthma",
  "COPD (Chronic Obstructive Pulmonary Disease)", "Bronchitis (Chronic)", "Sleep Apnea",
  "Arthritis - Osteoarthritis", "Arthritis - Rheumatoid", "Osteoporosis", "Joint Pain",
  "Back Pain (Chronic)", "Spinal Disc Problems", "Fibromyalgia", "Chronic Fatigue Syndrome",
  "Kidney Disease (Chronic)", "Kidney Stones", "Liver Disease - Fatty Liver", "Liver Disease - Cirrhosis",
  "Gallstones", "Gastritis", "GERD (Acid Reflux)", "Irritable Bowel Syndrome (IBS)",
  "Inflammatory Bowel Disease (IBD)", "Celiac Disease", "Lactose Intolerance", "Food Allergies",
  "Anemia - Iron Deficiency", "Anemia - Vitamin B12 Deficiency", "Vitamin D Deficiency", "Migraines",
  "Tension Headaches", "Epilepsy", "Stroke (History)", "Depression", "Anxiety Disorders", "Bipolar Disorder",
  "Schizophrenia", "Post-Traumatic Stress Disorder (PTSD)", "Autism Spectrum Disorder",
  "ADHD (Attention Deficit Hyperactivity Disorder)", "Cancer (History)", "Breast Cancer (History)",
  "Prostate Cancer (History)", "Skin Conditions - Psoriasis", "Skin Conditions - Eczema",
  "Skin Conditions - Acne (Severe)", "Vision Impairment", "Hearing Loss", "Pregnancy", "Postpartum Recovery",
];

export default function ProfilePage() {
  const { user } = useUser();
  const userId = user?.id as string;
  const allPlansFromDb = useQuery(api.plans.getUserPlans, { userId });
  const [plans, setPlans] = useState(staticPlans);

  const allPlans = allPlansFromDb?.length ? allPlansFromDb : plans;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const activePlan = allPlans.find((plan) => plan.isActive);
  const currentPlan = selectedPlanId
    ? allPlans.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  // Custom Plan States
  const [showModal, setShowModal] = useState(false);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [searchIssue, setSearchIssue] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  const filteredIssues = useMemo(
    () => healthIssuesList.filter((issue) =>
      issue.toLowerCase().includes(searchIssue.toLowerCase())
    ),
    [searchIssue]
  );

  const removeExercise = (day: string, exerciseName: string) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan._id === currentPlan?._id
          ? {
              ...plan,
              workoutPlan: {
                ...plan.workoutPlan,
                exercises: plan.workoutPlan.exercises.map(dayPlan =>
                  dayPlan.day === day
                    ? { ...dayPlan, routines: dayPlan.routines.filter(r => r.name !== exerciseName) }
                    : dayPlan
                ),
              },
            }
          : plan
      )
    );
  };

  const generateSmartPlan = () => {
    let dailyCalories = 2200;
    let baseExercises = [
      { name: "Push-ups", sets: 3, reps: 15 },
      { name: "Squats", sets: 3, reps: 12 },
      { name: "Planks", sets: 3, reps: 60 },
      { name: "Deadlifts", sets: 4, reps: 6 },
      { name: "Bench Press", sets: 4, reps: 8 },
    ];

    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      .slice(0, daysPerWeek);

    let workouts = days.map((day, idx) => ({
      day,
      routines: [baseExercises[idx % baseExercises.length]],
    }));

    let meals = [
      { name: "Breakfast", foods: ["Oatmeal", "Berries", "Egg whites"] },
      { name: "Lunch", foods: ["Chicken breast", "Brown rice", "Vegetables"] },
      { name: "Dinner", foods: ["Grilled fish", "Sweet potato", "Salad"] },
    ];

    if (goal === "Muscle Gain") {
      dailyCalories = 2800;
    }
    if (goal === "Fat Loss") {
      dailyCalories = 1800;
      meals = meals.map(m => ({ ...m, foods: m.foods.filter(f => f !== "Sweet potato") }));
    }

    if (selectedIssues.includes("Arthritis - Osteoarthritis")) {
      workouts = workouts.map(w => ({
        ...w,
        routines: w.routines.filter(r => r.name !== "Squats")
      }));
    }
    if (selectedIssues.includes("Diabetes (Type 2)")) {
      meals = meals.map(m => ({ ...m, foods: m.foods.filter(f => f !== "Brown rice") }));
    }

    return { dailyCalories, workouts, meals };
  };

  const handleAddCustomPlan = () => {
    const { dailyCalories, workouts, meals } = generateSmartPlan();
    const newPlan = {
      _id: Date.now().toString(),
      userId,
      name: `${goal || "General"} Plan (${age}y) - ${daysPerWeek} days/week`,
      isActive: false,
      dietPlan: { dailyCalories, meals },
      workoutPlan: { schedule: workouts.map(w => w.day), exercises: workouts },
    };
    setPlans(prev => [...prev, newPlan]);
    setShowModal(false);
  };

  return (
    <section className="relative z-10 pt-12 pb-32 container mx-auto px-4">
      <ProfileHeader user={user} />

      {allPlans.length > 0 ? (
        <div className="space-y-8">
          {/* PLAN SELECTOR */}
          <div className="relative backdrop-blur-sm border p-6 rounded-lg shadow-sm">
            <CornerElements />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Fitness Plans</h2>
              <span className="font-mono text-xs text-muted-foreground">
                TOTAL: {allPlans.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allPlans.map(plan => (
                <Button
                  key={plan._id}
                  onClick={() => setSelectedPlanId(plan._id)}
                  variant={selectedPlanId === plan._id ? "default" : "outline"}
                >
                  {plan.name}
                  {plan.isActive && (
                    <span className="ml-2 bg-green-500/20 text-green-500 text-xs px-2 rounded">
                      ACTIVE
                    </span>
                  )}
                </Button>
              ))}
              <Button variant="outline" onClick={() => setShowModal(true)}>
                <PlusCircleIcon size={16} /> Customize Plan
              </Button>
            </div>
          </div>

          {/* PLAN DETAILS */}
          {currentPlan && (
            <div className="backdrop-blur-sm border rounded-lg p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <DumbbellIcon size={20} /> PLAN:{" "}
                <span className="text-primary">{currentPlan.name}</span>
              </h3>
              <div className="mb-4 text-sm font-mono text-muted-foreground">
                <CalendarIcon size={16} className="inline mr-1" />
                SCHEDULE: {currentPlan.workoutPlan.schedule.join(", ")}
              </div>
              <Accordion type="single" collapsible>
                {currentPlan.workoutPlan.exercises.map(dayPlan => (
                  <AccordionItem key={dayPlan.day} value={dayPlan.day}>
                    <AccordionTrigger>
                      {dayPlan.day} - {dayPlan.routines.length} Exercises
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6">
                        {dayPlan.routines.map((exercise, idx) => (
                          <li key={idx} className="flex justify-between items-center">
                            <span>
                              <strong>{exercise.name}</strong>: {exercise.sets} sets × {exercise.reps} reps
                            </span>
                            <button
                              className="text-red-500 text-xs ml-2"
                              onClick={() => removeExercise(dayPlan.day, exercise.name)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* CUSTOM PLAN MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-background p-6 rounded-lg w-full max-w-lg relative overflow-y-auto max-h-[90vh] shadow-lg animate-in fade-in zoom-in-95">
                <button
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowModal(false)}
                >
                  <X size={18} />
                </button>
                <h2 className="text-lg font-bold mb-4">Create Your Custom Plan</h2>

                {/* Personal Info */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="p-2 border rounded" />
                  <input type="number" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} className="p-2 border rounded" />
                  <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="p-2 border rounded" />
                </div>

                {/* Goal */}
                <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full p-2 border rounded mb-3">
                  <option value="">Select Goal</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Cardio">Cardio</option>
                </select>

                {/* Days per Week */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Days per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={daysPerWeek}
                    onChange={e => setDaysPerWeek(Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Searchable Health Issues */}
                <input
                  type="text"
                  placeholder="Search Health Issues"
                  value={searchIssue}
                  onChange={e => setSearchIssue(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border rounded p-2">
                  {filteredIssues.map(issue => (
                    <label key={issue} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue)}
                        onChange={() =>
                          setSelectedIssues(prev =>
                            prev.includes(issue)
                              ? prev.filter(i => i !== issue)
                              : [...prev, issue]
                          )
                        }
                      />
                      {issue}
                    </label>
                  ))}
                </div>

                {/* Save */}
                <Button className="w-full mt-3" onClick={handleAddCustomPlan}>
                  Save Custom Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <NoFitnessPlan />
      )}
    </section>
  );
}
  