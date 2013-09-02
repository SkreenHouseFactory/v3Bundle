<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class toolsExtension extends \Twig_Extension
{
    protected $slider_programs;
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
                array('1','1','1','1','1','1'),
                array('2x2' => 4,'1','1')
            ),
           'horizontal' => array(
                array('3x1' => 4,'1','1','1'),
                array('1','1','1','2x1' => 4,'1')
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
            'to_array' => new \Twig_Filter_Method($this, 'to_array'),
            'end' => new \Twig_Filter_Method($this, 'end'),
            'keywords_from_url' => new \Twig_Filter_Method($this, 'keywordsFromUrl'),
            'prepare_for_slider' => new \Twig_Filter_Method($this, 'prepareForSlider'),
        );
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
    public function to_array($stdClass)
    {
			return (array)$stdClass;
    }

    /**
     * last item of array
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function end($arr)
    {
			return end($arr);
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

    /**
     * 404 => search
     * 
     * @param <object> $stdClass
     * @return <array> 
     */
    public function prepareForSlider(Array $programs, $nb_programs_page)
    {
        $this->slider_programs = $programs;
        $pages = array();
        while($page_programs = $this->getProgramsForPage($nb_programs_page)) {
            $slider_progam = $this->getHorizontalSlider($page_programs);
            $type = $slider_progam ? 'horizontal' : 'vertical';
            $pages[] = $this->sortPrograms($page_programs, $type, $nb_programs_page, $slider_progam);
        }
        return $pages;
    }
    protected function getHorizontalSlider(&$programs){
        foreach($programs as $key=>$program){
            if( isset($program->sliderPicture) ){
                unset($programs[$key]);
                return $program;
            }
        }
    }
    protected function getProgramsForPage($nb_programs_page) {
        $programs = array_slice($this->slider_programs, 0, $nb_programs_page);
        return $programs;
    }
    protected function sortPrograms($page_programs, $type, $nb_programs_page, $slider_progam = null){
        $programs = array();
        $n = 0;
        $i = 0;

        $combinaisons = $this->slider_combinaisons[$nb_programs_page][$type];
        shuffle($combinaisons);
        $page_programs = array_values($page_programs);
        foreach ($combinaisons[0] as $c => $nb) {
            $program = $page_programs[$i];
            $i++;
            if ($n < 6) {
                $c = $c == 0 ? 1 : $c;
                $picture = $nb > 1 && $type == 'horizontal' ? $program->sliderPicture : $program->picture;
                $program->picture = str_replace($this->slider_size[$nb_programs_page][$c], '150/200', $picture);
                $program->combinaison_type = $c;
                $program->combinaison_size = $nb;
                $programs[] = $nb > 1 && $type == 'horizontal' ? $slider_progam : $page_programs[$i];
                $n = $n + $nb;
                echo $n;
                //print_r(array($this->slider_programs, array($program)));
                //exit();
                array_diff($this->slider_programs, (array)array($program));

            }
        }
        return $programs;
    }
}