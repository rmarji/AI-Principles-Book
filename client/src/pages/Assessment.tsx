import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Database,
  Server,
  Settings,
  Users,
  RotateCcw,
  BookOpen,
  Target
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  questions,
  dimensions,
  readinessLevels,
  getRecommendations,
  type AssessmentQuestion
} from "@/lib/assessmentData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  compass: Compass,
  server: Server,
  database: Database,
  users: Users,
  settings: Settings
};

type AssessmentState = "intro" | "questions" | "results";

interface Answers {
  [questionId: string]: number;
}

export default function Assessment() {
  const [state, setState] = useState<AssessmentState>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasCurrentAnswer = currentQuestion && answers[currentQuestion.id] !== undefined;

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: score
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setState("results");
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setState("intro");
  };

  const calculateDimensionScores = () => {
    const scores: Record<string, { total: number; count: number }> = {};
    
    dimensions.forEach(dim => {
      scores[dim.id] = { total: 0, count: 0 };
    });

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        scores[question.dimension].total += score;
        scores[question.dimension].count += 1;
      }
    });

    return dimensions.map(dim => ({
      dimension: dim.id,
      name: dim.name,
      score: scores[dim.id].count > 0 
        ? Math.round((scores[dim.id].total / scores[dim.id].count) * 10) / 10
        : 0,
      fullMark: 5
    }));
  };

  const getOverallScore = () => {
    const dimensionScores = calculateDimensionScores();
    const total = dimensionScores.reduce((sum, d) => sum + d.score, 0);
    return Math.round((total / dimensionScores.length) * 10) / 10;
  };

  const getReadinessLevel = (score: number) => {
    return readinessLevels.find(level => score >= level.range[0] && score < level.range[1]) 
      || readinessLevels[readinessLevels.length - 1];
  };

  const getDimensionForCurrentQuestion = () => {
    return dimensions.find(d => d.id === currentQuestion?.dimension);
  };

  if (state === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/">
            <Button variant="ghost" className="mb-8" data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Book
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                AI Readiness Assessment
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Evaluate your organization's preparedness for AI adoption across five critical dimensions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {dimensions.map((dim, index) => {
                const Icon = iconMap[dim.icon];
                return (
                  <motion.div
                    key={dim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full" data-testid={`card-dimension-${dim.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle className="text-base">{dim.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{dim.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <BookOpen className="w-8 h-8 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">What You'll Get</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Scores across 5 key readiness dimensions</li>
                      <li>• Visual radar chart showing your organization's profile</li>
                      <li>• Overall readiness level classification</li>
                      <li>• Personalized recommendations for each dimension</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {questions.length} questions • Takes about 5 minutes
              </p>
              <Button size="lg" onClick={() => setState("questions")} data-testid="button-start-assessment">
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (state === "questions") {
    const currentDimension = getDimensionForCurrentQuestion();
    const DimensionIcon = currentDimension ? iconMap[currentDimension.icon] : Compass;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleRestart} data-testid="button-restart">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart
              </Button>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentDimension && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <DimensionIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">{currentDimension.name}</span>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl leading-relaxed" data-testid="text-question">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString()}
                    onValueChange={(value) => handleAnswer(parseInt(value))}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleAnswer(option.score)}
                          data-testid={`option-${index}`}
                        >
                          <RadioGroupItem
                            value={option.score.toString()}
                            id={`option-${index}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="text-sm leading-relaxed cursor-pointer flex-1"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasCurrentAnswer}
              data-testid="button-next"
            >
              {isLastQuestion ? "View Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dimensionScores = calculateDimensionScores();
  const overallScore = getOverallScore();
  const readinessLevel = getReadinessLevel(overallScore);

  return (
    <div className="min-h-screen bg-background">
      <ScrollArea className="h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <Button variant="ghost" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Book
                </Button>
              </Link>
              <Button variant="outline" onClick={handleRestart} data-testid="button-retake">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Assessment
              </Button>
            </div>

            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: `${readinessLevel.color}20` }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: readinessLevel.color }} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Your AI Readiness Results
              </h1>
              <p className="text-muted-foreground">
                Assessment completed with {questions.length} questions across {dimensions.length} dimensions
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <Card data-testid="card-overall-score">
                <CardHeader>
                  <CardTitle>Overall Readiness Score</CardTitle>
                  <CardDescription>Your organization's AI readiness level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-6xl font-bold mb-2" style={{ color: readinessLevel.color }}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">out of 5.0</div>
                    <div
                      className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${readinessLevel.color}20`, color: readinessLevel.color }}
                      data-testid="text-readiness-level"
                    >
                      {readinessLevel.level}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    {readinessLevel.description}
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-radar-chart">
                <CardHeader>
                  <CardTitle>Dimension Profile</CardTitle>
                  <CardDescription>Scores across five key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={dimensionScores}>
                        <PolarGrid />
                        <PolarAngleAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 5]} 
                          tick={{ fontSize: 10 }}
                        />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Dimension Breakdown & Recommendations
            </h2>

            <div className="space-y-6">
              {dimensionScores.map((dimScore, index) => {
                const dim = dimensions.find(d => d.id === dimScore.dimension);
                if (!dim) return null;
                
                const Icon = iconMap[dim.icon];
                const recommendations = getRecommendations(dim.id, dimScore.score);
                const scoreColor = dimScore.score <= 2 ? "#ef4444" 
                  : dimScore.score <= 3.5 ? "#eab308" 
                  : "#22c55e";

                return (
                  <motion.div
                    key={dim.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card data-testid={`card-result-${dim.id}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{dim.name}</CardTitle>
                              <CardDescription>{dim.description}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold" style={{ color: scoreColor }}>
                              {dimScore.score}
                            </div>
                            <div className="text-xs text-muted-foreground">/ 5.0</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <Progress 
                            value={(dimScore.score / 5) * 100} 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                          <ul className="space-y-1">
                            {recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <Card className="mt-8" data-testid="card-next-steps">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Continue reading "The Leader's Guide to AI Teams" to learn how to build and manage
                  your AI agent workforce based on your current readiness level.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/chapter/chapter-1">
                    <Button data-testid="button-start-reading">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Reading
                    </Button>
                  </Link>
                  <Link href="/toc">
                    <Button variant="outline" data-testid="button-view-toc">
                      View Table of Contents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
