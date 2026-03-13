import { getCategoryReports, getStockDetails } from "@/lib/actions/reports"
import { getStockOpnames } from "@/lib/actions/stock"
import { getActiveGuardianDuty } from "@/lib/actions/guardian"
import { ReportView } from "@/app/reports/report-view"
import { Spline_Sans } from "next/font/google"

const splineSans = Spline_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default async function ReportsPage() {
  const [categoryReports, stockDetails, stockOpnames, activeGuardian] = await Promise.all([
    getCategoryReports(),
    getStockDetails(),
    getStockOpnames(),
    getActiveGuardianDuty()
  ])

  return (
    <div className={`${splineSans.className} enter-rise pb-16`}>
      <ReportView 
        categoryReports={categoryReports} 
        stockDetails={stockDetails} 
        stockOpnames={stockOpnames}
        activeGuardian={activeGuardian}
      />
    </div>
  )
}
