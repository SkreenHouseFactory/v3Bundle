<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class ToolsExtension extends \Twig_Extension
{
    protected static $slider_count;
    protected $slider_page;
    protected $slider_programs;
    protected $input_slider_size = array('143/180','150/200','990/450','1500/450');
    protected $slider_size = array(
        6 => array(
          '2x2' => '294/370',
          '3x1' => '445/180',
          '2x1' => '294/180',
          '1'=> '143/180'
        )
    );
    protected $slider_combinaisons = array(
        '6'=> array(
           'vertical' => array(
                array('1','1','1','1','1','1','1','1'),
                array('2x2' => 4,'1','1','1','1','1')
            ),
           'horizontal' => array(
                array('3x1' => 3,'1','1','1','1','1','1'),
                array('2x1' => 2,'1','1','1','1','1','1')
            )
        )
    );
    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
      return array(
        'pic_filter' => new \Twig_Filter_Method($this, 'picFilter'),
        'to_array' => new \Twig_Filter_Method($this, 'to_array'),
        'end' => new \Twig_Filter_Method($this, 'end'),
        'keywords_from_url' => new \Twig_Filter_Method($this, 'keywordsFromUrl'),
        'prepare_for_slider' => new \Twig_Filter_Method($this, 'prepareForSlider'),
        'round_up' => new \Twig_Filter_Method($this, 'roundUp'),
        'pagination' => new \Twig_Filter_Method($this, 'pagination',array('page','pagination')),
        'rot13' => new \Twig_Filter_Method($this, 'rot13'),
        'sold_perc' => new \Twig_Filter_Method($this, 'soldPerc'),
        'count_nb_page'=> new \Twig_Filter_Method($this, 'countNbPage'),
        'extract_bgd'=> new \Twig_Filter_Method($this, 'extract_bgd'),
        'accessFromHasvod'=> new \Twig_Filter_Method($this, 'accessFromHasvod'),
        'md_casting'=> new \Twig_Filter_Method($this, 'md_casting'),
        'iso8601'=> new \Twig_Filter_Method($this, 'iso8601'),
        'html_entity_decode'=> new \Twig_Filter_Method($this, 'html_entity_decode'),
        'wordCut' => new \Twig_Filter_Method($this, 'wordCut'),
        'striptagsAndRaw' => new \Twig_Filter_Method($this, 'striptagsAndRaw'),
      );
    }

  // Striptags, raw, and slice
  public function striptagsAndRaw($text){
    $new_text = strip_tags($text);
    $new_text = html_entity_decode($new_text);
    return $new_text;
  }

  // coupe le texte apres $limit caracteres sans couper les mots
  /*
   * $text = texte à couper
   * $limit = int, on coupe à partir de cette limite
   * $msg, chaine à coller apres la coupure (generalement des ...)
   */
  public function wordCut($text, $limit, $msg=''){
    if (strlen($text) > $limit){
      $txt1 = wordwrap($text, $limit, '[cut]');
      $txt2 = explode('[cut]', $txt1);
      $ourTxt = $txt2[0];
      $finalTxt = $ourTxt.$msg;
    } else {
      $finalTxt = $text;
    }
    return $finalTxt;
  }

  /**
  * html_entity_decode
  */
  public function html_entity_decode($str)
  {
    return html_entity_decode($str);
  }

    /**
    * date iso
    */
    public function iso8601($duration)
    {
      $nb_hours = floor($duration/60);
      $nb_min = $duration - $nb_hours * 60;
      return 'T'.($nb_hours?$nb_hours.'H':'').$nb_min.'M0S';
    }

    /**
    * accessFromHasvod
    */
    public function accessFromHasvod($has_vod)
    {
      switch ($has_vod) {
        case 3:
          return ' en dvd';
        break;
        case 4:
          return 'au cinéma';
        break;
        case 5:
          return 'à la Télé';
        break;
        case 6:
        case 7:
        case 8:
          return 'en Replay';
        break;
        case 1:
        case 2:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        default:
          return 'en streaming';
        break;
      }
    }

    /**
    * Generate background image for channel-cover
    */
    public function extract_bgd($src, $width = 1)
    {
      return 'http://s0.mskstatic.com/extract-background.php?src='.$src.'&x=1&y=1&width='.$width.'';
    }

    public function md_casting($casting)
    {
      switch ($casting) {
        case 'Réalisateur':
          return 'director';
          break;
        case 'Compositeur':
          return 'musicBy';
          break;
        case 'Producteur':
          return 'producer';
          break;
        case 'société de production':
          return 'productionCompany';
          break;
        case 'Acteur':
          return 'actor';
          break;
        default:
          return 'out';
          break;
      }
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'tools';
    }
    
    /**
     * cast object as array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function to_array($stdClass, $with_id_as_key = false)
    {
      if ($with_id_as_key) {
        $arr = array();
        foreach ((array)$stdClass as $v) {
          //HACK programmes adultes, TOFIX in API
          if (isset($v->error)) {
            //print_r($v);exit();
            continue;
          }
          $arr[$v->id] = $v;
        }
        return $arr;
      } else {
			  return (array)$stdClass;
      }
    }
    /**
     * cast object as array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function roundUp($number)
    {
        return ceil($number);
    }


    public function picFilter($test)
    {
      preg_match('#(?<title>medias(\/\w{1,}){1,}\-{0,}\w{1,}.)#i', $test, $matches);
      return $matches['title'];
    }
    public function rot13($string)
    { 
      return str_rot13(urlencode($string));
    }
    public function replaceLink($string)
    {
      return str_replace('/','/',$string);
    }
    /**
     * last item of array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function pagination($count,$page,$page_offset)
    { 
      $total_page = ceil($count/$page_offset);
      $response = Array();
      
      if ($total_page <= 10) { //On gère les cas où il y a maximum 10 pages de programmes
        for ($i = 1;$i <= $total_page; $i++) {
          $response[$i]= true;
        }
      } else { // On gère les cas où il y a au moins 11 pages de programmes
        $dizaine_inf = floor($page/10)*10;
        $dizaine_inf_tot = floor($total_page/10)*10;
        
        for ($i = 1; $i <= $total_page; $i++) {
          if ($page == 1 || $page%10 == 0) {
            if ($i == 1 || $i == $page) {
              $response[$i] = true;
            } else if ($i > $dizaine_inf &&
                      $i == $dizaine_inf + 11 &&
                      $i == $dizaine_inf_tot+1 &&
                      $dizaine_inf_tot+1 != $page) {
               $response[$i] = null;
            } else if ($i%10 == 0 && $i > $dizaine_inf) {
                if ($page == 1) {
                  $response[$i] = true;
                } else {
                  $response[$i] = false;
                }
            } else if ($i > $dizaine_inf && $i <= $dizaine_inf + 9) {
              $response[$i] = true;
            } 
          } else {
            if ($i%10 == 0 || $i == 1) {
              $response[$i] = true;
            } else if ($i > $dizaine_inf  && $i == $dizaine_inf + 11 && $i == $dizaine_inf_tot+1  && $dizaine_inf_tot+1 != $page) {
              $response[$i] = null;
            } else if ($i > $dizaine_inf && $i <= $dizaine_inf + 9) {
              $response[$i] = false;
            }
          }
        }       
      }
			return $response;
    }
    
    /**
     * 
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function end($arr)
    {
			return end($arr);
    }

    public function soldPerc($price,$sold_price){
       $perc = $price/$sold_price;
       $perc = $perc * 100;
      return ceil($perc);
    }

    /**
     * 404 => search
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function keywordsFromUrl($url)
    {
      $keywords = array();
      foreach (explode('-', urldecode($url)) as $word) {
        if (!is_numeric($word)) {
          $keywords[] = $word;
        }
      }
			return implode(' ', $keywords);
    }
    public function countNbPage($array){
      $length = count($array);
      
     $nb_page = ceil(($length-1)/9);
      
      return $nb_page;
    }
    /**
     * slider
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function prepareForSlider(Array $programs, $nb_programs_page, $nb_programs_total = null, $slider_page = 0, $slider_combinaisons = null)
    {
     // echo '<!--';

      //set specific combinaisons
      if ($slider_combinaisons) {
        $this->slider_combinaisons_tmp = $this->slider_combinaisons;
        $this->slider_combinaisons = $slider_combinaisons;
      }

      self::$slider_count++;
      $this->slider_page = $slider_page;
      $this->slider_programs = $this->to_array($programs, true);
      $pages = array();
     // echo "\n".'<br/> $this->slider_programs > '.count($this->slider_programs);
      while (count($this->slider_programs) > 0 || (count($pages) < $nb_programs_total/6 && count($pages) <= 4) ) {
       // echo "\n".'<br/> $pages > '.count($pages);
       // echo "\n".'<br/> $nb_pages_total > '.($nb_programs_total/6);
        $this->slider_page++;
        if ($page_programs = $this->getProgramsForPage($nb_programs_page)) {
          // echo ' page_programs count:'.count($page_programs);
          $slider_progam = $this->getHorizontalSlider($page_programs);
          $type = $slider_progam ? 'horizontal' : 'vertical';
          $pages[] = $this->sortPrograms($page_programs, $nb_programs_page, $type, $slider_progam);
        } else {
          $pages[] = array();
        }
        // echo ' break count:'.count($this->slider_programs);
        //break;
        //print_r($pages);
      }
      // echo '-->';

       //reset default combinaisons
       if ($slider_combinaisons) {
         $this->slider_combinaisons = $this->slider_combinaisons_tmp;
       }
      return $pages;
    }
    protected function getHorizontalSliderPosition($combinaison) {
      $i = 0;
      foreach ($combinaison as $c => $nb) {
        if (!is_numeric($c)) {
          return $i;
        }
        $i++;
      }
    }
    protected function getHorizontalSlider(&$programs){
      foreach ($programs as $key => $program) {
        //si image force
        if (isset($program->popular_channel) && 
            isset($program->popular_channel->img_override_program) && 
            $program->popular_channel->img_override_program) {
          continue;
        }
        //default
        if (isset($program->sliderPicture) || 
            (isset($program->maxsize) && 
             $program->maxsize->width > $program->maxsize->height && 
             $program->maxsize->width > 250)) {
          $programs = array_values($programs);
         // echo "\n".'getHorizontalSlider:'.$program->id.' $key:'.$key;
          if (!isset($program->sliderPicture)) $program->sliderPicture = $program->picture;
          return $program;
        }
      }
    }
    protected function getProgramsForPage($nb_programs_page) {
      // echo '<br>getProgramsForPage:'.count($this->slider_programs);
      $programs = count($this->slider_programs) >= $nb_programs_page ? array_slice($this->slider_programs, 0, $nb_programs_page) : $this->slider_programs;
    // echo "\n".'<br/>getProgramsForPage '.implode('-', array_keys($this->to_array($programs, true)));
      return count($programs) > 0 ? $programs : null;
    }

    protected function sortPrograms($page_programs, $nb_programs_page, $type, $slider_program = null){
      $programs = array();
      $done = array();
      $n = 0;
      $i = 0;

      $page_programs = array_values($page_programs);
      
      if (!isset($this->slider_combinaisons[$nb_programs_page][$type]) || 
          !count($this->slider_combinaisons[$nb_programs_page][$type])) {
        $type = 'vertical';
      }

      $combinaisons = $this->slider_combinaisons[$nb_programs_page][$type];
      if (isset($this->slider_combinaisons[$nb_programs_page]['vertical'][1]) && count($page_programs) < 4) {
        $combinaison = $this->slider_combinaisons[$nb_programs_page]['vertical'][1];
        $type = 'vertical';
      // echo "\n".'<br/>force combinaison nb_program < 4';
      } elseif (isset($combinaisons[1]) && (self::$slider_count+$this->slider_page)%2 == 0) {
        $combinaison = $combinaisons[1];
      } else {
        $combinaison = $combinaisons[0];
      }
     // echo "\n".'$page_programs:';
      foreach($page_programs as $p){
       // echo "\n".' p:'.$p->id.','.$p->title;
      }
     // echo "\n".'<br/>NEWPAGE '.implode('-', $combinaison);
     // echo '$page_programs_keys '.implode('-', array_keys($page_programs));
      foreach ($combinaison as $c => $nb) {
        if (!isset($page_programs[$i])) {
         // echo "\n".'<br/>stop no more programs:'.$i;
          break;
        }
        if (in_array($page_programs[$i]->id, $done)) {
          $i++;
         // echo "\n".'<br/>done, continue to : '.$i;
          continue;
        }

       // echo "\n".'<br/>i:'.$i.' c:'.$c.' p:'.$page_programs[$i]->id.','.$page_programs[$i]->title;
  
        if ($n >= $nb_programs_page) {
          // echo "\n".' nottaken:'.$i;
        } else {

          //slider horizontal
          $c = is_numeric($c) ? 1 : $c;
          if (!is_numeric($c) && $type == 'horizontal') {
            //push next current program
            if ($slider_program->id != $page_programs[$i]->id) {
              $page_programs[$i+1] = $page_programs[$i];
            } else {
               $i++;
            }
            $slider_program->sliderPicture = str_replace('1200/630', '445/180', $slider_program->sliderPicture);
            $picture = $slider_program->sliderPicture;
            $program = $slider_program;
           // echo ' -- takeslider:'.$slider_program->id.'($slider_program:'.$slider_program->sliderPicture.')';


          //default
          } else {

            //replace slider_program
            if ($type == 'horizontal' &&
                $page_programs[$i]->id == $slider_program->id &&
                isset($page_programs[$this->getHorizontalSliderPosition($combinaison)])) {
              $program = $page_programs[$this->getHorizontalSliderPosition($combinaison)];
             // echo ' -- replaceslider:'.$program->id;
            //take program
            } else {
              $program = $page_programs[$i];
             // echo ' -- takeprogram:'.$program->id;
              $i++;
            }
            $picture = $program->picture;
          }
          
          //echo 'picture : $this->slider_size['.$nb_programs_page.']['.$c.']';
          if (isset($this->slider_size[$nb_programs_page][$c])) {
            $picture = str_replace('/c/','/', $picture);
            //echo '$picture(1) : '.$picture;
            $program->picture = str_replace(
              $this->input_slider_size, 
              $this->slider_size[$nb_programs_page][$c].'/c', 
              $picture
            );
            if ($type == 'horizontal') {
              //hack si pas de dimension
              $program->picture = str_replace(
                '.com/medias', 
                '.com/'.$this->slider_size[$nb_programs_page][$c].'/c/medias', 
                $picture
              );
              //si pas de slider resize photo
              if (!strstr($slider_program->sliderPicture, '/Slider')) {
                $program->picture = str_replace('/medias', '/c/medias', str_replace(
                  $this->input_slider_size, 
                  $this->slider_size[$nb_programs_page][$c], 
                  $picture
                ));
              }
            }
          }
          $program->combinaison_type = $c;
          $programs[$i] = $program;
          $done[] = $program->id;
          $n = $n + $nb;
          unset($this->slider_programs[$program->id]);
          // echo ' -1';
          // echo ' n:'.$n.'('.$c.', '.count($this->slider_programs).')';
        }
      }
      return $programs;
    }
}