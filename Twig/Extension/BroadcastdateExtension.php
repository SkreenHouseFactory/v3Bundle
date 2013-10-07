<?php

namespace SkreenHouseFactory\v3Bundle\Twig\Extension;

use Symfony\Component\HttpKernel\KernelInterface;

class broadcastdateExtension extends \Twig_Extension
{
    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return array(
            'broadcastdate' => new \Twig_Filter_Method($this, 'broadcastdate'),
            'remainingtv' => new \Twig_Filter_Method($this, 'remainingtv'),
            'remainingreplay' => new \Twig_Filter_Method($this, 'remainingreplay'),
            'timeleft' => new \Twig_Filter_Method($this, 'timeleft'),
        );
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'broadcastdate';
    }

    /**
     * get remaining time message
     * 
     * @param string $string
     * @return int 
     */
    public function remainingtv ($time)
    {
			$remaining = $time - time() + 3600;
			if ($remaining < 0) {
				return 'Bientôt disponible en Replay';
			} elseif ($remaining/3600 < 24 ) {
        $nb_hours = round($remaining/3600);
				return 'En Replay dans ' . $nb_hours . ' heure'.($nb_hours > 1 ? 's' : null);
			} elseif ($remaining/3600 < 73 ) {
        $nb_days = round($remaining/(3600*24));
				return 'En Replay dans ' . $nb_days . ' jour'.($nb_days > 1 ? 's' : null);
			}
    }

    /**
     * get remaining time message
     * 
     * @param string $string
     * @return int 
     */
    public function remainingreplay ($time)
    {
			$remaining = $time - time() + 3600;
			if ($remaining < 0) {
			} elseif ($remaining/3600 < 24 ) {
        $nb_hours = round($remaining/3600);
				return 'Encore ' . $nb_hours . ' h !';
			} elseif ($remaining/3600 < 73 ) {
        $nb_days = round($remaining/(3600*24));
				return 'Encore ' . $nb_days . ' jour'.($nb_days > 1 ? 's' : null);
			}
    }

    /**
     * get time left message
     * 
     * @param string $string
     * @return int 
     */
    public function timeleft ($time)
    {
			$timeleft = time() - $time;
			if ($timeleft < 0) {
				return;
			}
      
			if ($timeleft/3600 < 1) {
        $nb_mn = round($timeleft/60);
				return $nb_mn . ' min';
			} elseif ($timeleft/3600 < 24) {
        $nb_hours = round($timeleft/3600);
				return $nb_hours . ' heure'.($nb_hours > 1 ? 's' : null);
			} elseif ($timeleft/3600 < 72) {
        $nb_days = round($timeleft/(3600*24));
				return $nb_days . ' jour'.($nb_days > 1 ? 's' : null);
			}
    }

    /**
     * Converts a string to time
     * 
     * @param string $string
     * @return int 
     */
    public function broadcastdate ($time, $access = null, $format = null)
    {
			if ($time) {
        $article = $access == 'Replay' ? '' : 'le ';
				$month = $this->getMonth(date('m', $time));
        if (date('Y', $time) != date('Y')) {
          $month .= ' '.date('Y', $time);
        }
				$tomorrow = $article . date('d', $time + 24*3600) . ' ' . $this->getMonth(date('m', $time + 24*3600));
				$yesterday = $article . date('d', $time - 24*3600) . ' ' . $this->getMonth(date('m', $time - 24*3600));
				$string = $article . date('d', $time) . ' ' . $month . ($format != 'date' ? ' à ' . date('G\hi', $time) : null);
        if (date('Ymd', $time) == date('Ymdd')) {
			    $string = str_replace('le ' . date('d ') . $month, 'Aujourd\'hui', $string); //today
        }
				if (strstr($string, $tomorrow .' 2')) {
					$string = str_replace($tomorrow, 'Demain soir', $string); //tommorow night
				}
				if (strstr($string, $yesterday .' 2')) {
					$string = str_replace($yesterday, 'Hier soir', $string); //yesterday night
				}
				$string = str_replace($tomorrow, 'Demain', $string); //tommorow
				$string = str_replace($yesterday, 'Hier', $string); //yesterday

	    	return $string;
			}
    }

    /**
     * Converts a string to time
     * 
     * @param string $string
     * @return int 
     */
    protected function getMonth ($number)
    {
			switch((int)$number) {
				case 1: return 'Janv.'; break;
				case 2: return 'Fév.'; break;
				case 3: return 'Mars'; break;
				case 4: return 'Avril'; break;
				case 5: return 'Mai'; break;
				case 6: return 'Juin'; break;
				case 7: return 'Juil.'; break;
				case 8: return 'Août'; break;
				case 9: return 'Sept.'; break;
				case 10: return 'Oct.'; break;
				case 11: return 'Nov.'; break;
				case 12: return 'Déc.'; break;
			}
		}
}