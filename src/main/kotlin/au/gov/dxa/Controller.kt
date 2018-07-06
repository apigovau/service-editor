package au.gov.dxa

import com.beust.klaxon.Klaxon
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.stereotype.Controller
import java.net.URL

@Controller
class Controller {


    @RequestMapping("/service/{id}")
    fun detailPage(@PathVariable id:String, model:MutableMap<String, Any?>): String{

        val auth = System.getenv("BasicAuth")?: throw RuntimeException("No environment variable: BasicAuth")
        model.put("BasicAuth", auth)

        return "editor"
    }


    data class IndexDTO(val content:List<IndexServiceDTO>)
    data class IndexServiceDTO(val id:String, val name:String, val description:String)
    @RequestMapping("/")
    fun index(model:MutableMap<String, Any?>):String{
        val baseRepoUri = System.getenv("BaseRepoURI")?: throw RuntimeException("No environment variable: BaseRepoURI")
        val apiResponse = URL(baseRepoUri+"/index").readText()
        val index = Klaxon().parse<au.gov.dxa.Controller.IndexDTO>(apiResponse)

        model.put("index", index!!.content)

        return "index"
    }



}
