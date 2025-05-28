"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Trophy, Star, Crown, Diamond } from "lucide-react"
import DashboardLayout from "@/components/layouts/DashboardLayout"

const achievements = [
  {
    id: "bronze",
    name: "Placa Bronze",
    description: "Alcance R$ 10.000 em vendas",
    target: 10000,
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    unlocked: false,
  },
  {
    id: "silver",
    name: "Placa Prata",
    description: "Alcance R$ 50.000 em vendas",
    target: 50000,
    icon: Trophy,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    unlocked: false,
  },
  {
    id: "gold",
    name: "Placa Ouro",
    description: "Alcance R$ 100.000 em vendas",
    target: 100000,
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    unlocked: false,
  },
  {
    id: "platinum",
    name: "Placa Platina",
    description: "Alcance R$ 500.000 em vendas",
    target: 500000,
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    unlocked: false,
  },
  {
    id: "diamond",
    name: "Placa Diamante",
    description: "Alcance R$ 1.000.000 em vendas",
    target: 1000000,
    icon: Diamond,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    unlocked: false,
  },
]

export default function AchievementsPage() {
  const [userStats, setUserStats] = useState({
    totalRevenue: 4500,
    totalSales: 23,
  })

  const calculateProgress = (target: number) => {
    return Math.min((userStats.totalRevenue / target) * 100, 100)
  }

  const isUnlocked = (target: number) => {
    return userStats.totalRevenue >= target
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conquistas e Recompensas</h1>
          <p className="text-gray-600">Acompanhe seu progresso e conquiste recompensas incríveis</p>
        </div>

        {/* Current Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Progresso Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">R$ {userStats.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-3xl font-bold text-blue-600">{userStats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progress = calculateProgress(achievement.target)
            const unlocked = isUnlocked(achievement.target)

            return (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden ${unlocked ? "ring-2 ring-green-500" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${achievement.bgColor}`}>
                      <Icon className={`h-8 w-8 ${achievement.color}`} />
                    </div>
                    {unlocked && <Badge className="bg-green-100 text-green-800">Conquistado!</Badge>}
                  </div>
                  <CardTitle className={unlocked ? "" : "opacity-50"}>{achievement.name}</CardTitle>
                  <CardDescription className={unlocked ? "" : "opacity-50"}>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-600">
                      R$ {userStats.totalRevenue.toLocaleString()} / R$ {achievement.target.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
                {unlocked && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-green-500">
                    <Star className="absolute -top-8 -right-6 h-4 w-4 text-white" />
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Ranking Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking Geral</CardTitle>
            <CardDescription>Veja como você está comparado a outros usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { position: 1, name: "Maria Silva", revenue: 250000, badge: "Platina" },
                { position: 2, name: "João Santos", revenue: 180000, badge: "Ouro" },
                { position: 3, name: "Ana Costa", revenue: 120000, badge: "Ouro" },
                { position: 15, name: "Você", revenue: userStats.totalRevenue, badge: "Bronze" },
              ].map((user) => (
                <div
                  key={user.position}
                  className={`flex items-center justify-between p-3 rounded-lg ${user.name === "Você" ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.position <= 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.position}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-600">R$ {user.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{user.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
